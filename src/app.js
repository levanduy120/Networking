const express = require('express');
require('dotenv').config();
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const db = require('./db/database');
const { sendTicketEmails } = require('./services/email');

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const adminSessions = new Map();
const ADMIN_SESSION_TTL_MS = Number(process.env.ADMIN_SESSION_TTL_MINUTES || 120) * 60 * 1000;
const VALID_STATUSES = new Set(['open', 'in-progress', 'closed']);
const VALID_PRIORITIES = new Set(['low', 'medium', 'high', 'urgent']);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Quá nhiều lần đăng nhập. Vui lòng thử lại sau 15 phút.' }
});

const ticketLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau ít phút.' }
});

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://api.qrserver.com"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      frameSrc: ["'none'"],
    }
  },
  crossOriginEmbedderPolicy: false
}));

const allowedOrigin = process.env.ALLOWED_ORIGIN;
if (allowedOrigin) {
  app.use(cors({ origin: allowedOrigin, methods: ['GET', 'POST', 'PUT', 'DELETE'], credentials: false }));
}

app.use(bodyParser.json({ limit: '100kb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '100kb' }));
app.use(express.static(path.join(__dirname, '../public')));

setInterval(() => {
  const now = Date.now();
  for (const [token, session] of adminSessions.entries()) {
    if (now - session.lastSeenAt > ADMIN_SESSION_TTL_MS) {
      adminSessions.delete(token);
    }
  }
}, 60 * 60 * 1000);

function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-token'];
  const session = token ? adminSessions.get(token) : null;

  if (!session || Date.now() - session.lastSeenAt > ADMIN_SESSION_TTL_MS) {
    if (token) {
      adminSessions.delete(token);
    }
    return res.status(401).json({ error: 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại' });
  }

  session.lastSeenAt = Date.now();
  req.admin = session;
  next();
}

function createTicketCode() {
  return `NW-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

function isBcryptHash(value) {
  return typeof value === 'string' && value.startsWith('$2');
}

function comparePassword(inputPassword, storedPassword) {
  if (!storedPassword) {
    return false;
  }

  return isBcryptHash(storedPassword)
    ? bcrypt.compareSync(inputPassword, storedPassword)
    : inputPassword === storedPassword;
}

function upgradeLegacyPassword(user, plainPassword) {
  if (isBcryptHash(user.password)) {
    return;
  }

  const hashedPassword = bcrypt.hashSync(plainPassword, 12);
  db.run('UPDATE admin_users SET password = ? WHERE id = ?', [hashedPassword, user.id]);
}

function getTicketWithService(ticketId, callback) {
  db.get(
    `SELECT t.*, s.name as service_name FROM tickets t
     LEFT JOIN services s ON t.service_id = s.id
     WHERE t.id = ?`,
    [ticketId],
    callback
  );
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.get('/api/services', (req, res) => {
  db.all('SELECT * FROM services ORDER BY id ASC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.post('/api/tickets', ticketLimiter, (req, res) => {
  const { customer_name, customer_email, customer_phone, service_id, title, description, priority } = req.body;
  const cleanPriority = VALID_PRIORITIES.has(priority) ? priority : 'medium';

  if (!customer_name || !customer_email || !service_id || !title || !description) {
    return res.status(400).json({ error: 'Vui lòng điền tất cả thông tin bắt buộc' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(customer_email)) {
    return res.status(400).json({ error: 'Email không hợp lệ' });
  }

  const ticket_code = createTicketCode();

  db.run(
    `INSERT INTO tickets (ticket_code, customer_name, customer_email, customer_phone, service_id, title, description, priority, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'open')`,
    [
      ticket_code,
      customer_name.trim(),
      customer_email.trim(),
      customer_phone?.trim() || '',
      service_id,
      title.trim(),
      description.trim(),
      cleanPriority
    ],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      getTicketWithService(this.lastID, (ticketErr, ticket) => {
        if (ticketErr || !ticket) {
          console.error('Ticket email lookup error:', ticketErr);
          return;
        }

        sendTicketEmails(ticket).catch(emailErr => {
          console.error('Ticket email error:', emailErr.message);
        });
      });

      res.json({ success: true, ticket_code, id: this.lastID });
    }
  );
});

app.get('/api/tickets/search/:code', (req, res) => {
  const { code } = req.params;

  db.get(
    `SELECT t.*, s.name as service_name FROM tickets t
     LEFT JOIN services s ON t.service_id = s.id
     WHERE t.ticket_code = ?`,
    [code],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(404).json({ error: 'Không tìm thấy ticket' });
      }
      res.json(row);
    }
  );
});

app.post('/api/admin/login', loginLimiter, (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin' });
  }

  db.get(
    'SELECT * FROM admin_users WHERE username = ?',
    [username],
    (err, row) => {
      if (err || !row || !comparePassword(password, row.password)) {
        return res.status(401).json({ error: 'Sai tên đăng nhập hoặc mật khẩu' });
      }

      upgradeLegacyPassword(row, password);

      const token = crypto.randomUUID();
      adminSessions.set(token, {
        id: row.id,
        username: row.username,
        createdAt: Date.now(),
        lastSeenAt: Date.now()
      });

      res.json({ success: true, token, username: row.username });
    }
  );
});

app.post('/api/admin/logout', requireAdmin, (req, res) => {
  adminSessions.delete(req.headers['x-admin-token']);
  res.json({ success: true });
});

app.get('/api/admin/me', requireAdmin, (req, res) => {
  const remainingMs = ADMIN_SESSION_TTL_MS - (Date.now() - req.admin.lastSeenAt);
  res.json({ username: req.admin.username, sessionTtlMs: ADMIN_SESSION_TTL_MS, sessionRemainingMs: remainingMs });
});

app.get('/api/admin/tickets', requireAdmin, (req, res) => {
  db.all(
    `SELECT t.*, s.name as service_name FROM tickets t
     LEFT JOIN services s ON t.service_id = s.id
     ORDER BY t.created_at DESC`,
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

app.put('/api/admin/tickets/:id', requireAdmin, (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  if (!VALID_STATUSES.has(status)) {
    return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
  }

  db.run(
    'UPDATE tickets SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [status, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true });
    }
  );
});

app.delete('/api/admin/tickets/:id', requireAdmin, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM tickets WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true });
  });
});

app.get('/api/admin/services', requireAdmin, (req, res) => {
  db.all('SELECT * FROM services ORDER BY id ASC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.put('/api/admin/services/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { name, description, icon } = req.body;

  if (!name || !description) {
    return res.status(400).json({ error: 'Tên dịch vụ và mô tả là bắt buộc' });
  }

  if (name.trim().length > 100) {
    return res.status(400).json({ error: 'Tên dịch vụ không được quá 100 ký tự' });
  }

  if (description.trim().length > 1000) {
    return res.status(400).json({ error: 'Mô tả không được quá 1000 ký tự' });
  }

  db.run(
    'UPDATE services SET name = ?, description = ?, icon = ? WHERE id = ?',
    [name.trim(), description.trim(), icon || 'desktop', id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Không tìm thấy dịch vụ' });
      }
      res.json({ success: true });
    }
  );
});

app.post('/api/admin/change-password', requireAdmin, (req, res) => {
  const { old_password, new_password } = req.body;
  const username = req.admin.username;

  if (!old_password || !new_password) {
    return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
  }

  if (new_password.length < 8) {
    return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 8 ký tự' });
  }

  db.get(
    'SELECT * FROM admin_users WHERE username = ?',
    [username],
    (err, user) => {
      if (err || !user || !comparePassword(old_password, user.password)) {
        return res.status(401).json({ error: 'Mật khẩu hiện tại không đúng' });
      }

      const hashedPassword = bcrypt.hashSync(new_password, 12);
      db.run(
        'UPDATE admin_users SET password = ? WHERE username = ?',
        [hashedPassword, username],
        function(updateErr) {
          if (updateErr) {
            return res.status(500).json({ error: updateErr.message });
          }
          adminSessions.delete(req.headers['x-admin-token']);
          res.json({ success: true, message: 'Đổi mật khẩu thành công, vui lòng đăng nhập lại' });
        }
      );
    }
  );
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin.html'));
});

app.get('*', (req, res) => {
  res.status(404).send(`<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>404 - Không tìm thấy trang</title><style>body{font-family:Segoe UI,Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f4f8fb;color:#132238}div{text-align:center}h1{font-size:80px;margin:0;color:#0077b6}p{color:#5e6b7a;font-size:18px}a{color:#0077b6;font-weight:700;text-decoration:none}</style></head><body><div><h1>404</h1><p>Trang này không tồn tại.</p><a href="/">← Về trang chủ</a></div></body></html>`);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});

app.listen(PORT, HOST, () => {
  console.log(`Duy Network Engineer portal running at http://${HOST}:${PORT}`);
  console.log(`Admin panel: http://${HOST}:${PORT}/admin`);
});
