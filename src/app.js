const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const db = require('./db/database');

// Tạo thư mục data nếu chưa có
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// ============ ROUTES ============

// Trang chủ
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// API: Lấy danh sách dịch vụ
app.get('/api/services', (req, res) => {
  db.all("SELECT * FROM services", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// API: Tạo ticket mới
app.post('/api/tickets', (req, res) => {
  const { customer_name, customer_email, customer_phone, service_id, title, description, priority } = req.body;
  
  // Validate
  if (!customer_name || !customer_email || !service_id || !title || !description) {
    return res.status(400).json({ error: 'Vui lòng điền tất cả thông tin bắt buộc' });
  }

  // Tạo mã ticket
  const ticket_code = 'TK' + Date.now();

  db.run(
    `INSERT INTO tickets (ticket_code, customer_name, customer_email, customer_phone, service_id, title, description, priority, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'open')`,
    [ticket_code, customer_name, customer_email, customer_phone, service_id, title, description, priority || 'medium'],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ success: true, ticket_code, id: this.lastID });
    }
  );
});

// API: Lấy thông tin ticket (public, search bằng ticket code)
app.get('/api/tickets/search/:code', (req, res) => {
  const { code } = req.params;
  
  db.get(
    `SELECT t.*, s.name as service_name FROM tickets t 
     LEFT JOIN services s ON t.service_id = s.id
     WHERE t.ticket_code = ?`,
    [code],
    (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (!row) {
        res.status(404).json({ error: 'Không tìm thấy ticket' });
        return;
      }
      res.json(row);
    }
  );
});

// ============ ADMIN ROUTES ============

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  db.get(
    "SELECT * FROM admin_users WHERE username = ? AND password = ?",
    [username, password],
    (err, row) => {
      if (err || !row) {
        return res.status(401).json({ error: 'Sai tên đăng nhập hoặc mật khẩu' });
      }
      // Trong production, nên dùng JWT token
      res.json({ success: true, token: uuidv4() });
    }
  );
});

// Admin: Lấy tất cả ticket
app.get('/api/admin/tickets', (req, res) => {
  const token = req.headers['x-admin-token'];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  db.all(
    `SELECT t.*, s.name as service_name FROM tickets t 
     LEFT JOIN services s ON t.service_id = s.id
     ORDER BY t.created_at DESC`,
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// Admin: Cập nhật trạng thái ticket
app.put('/api/admin/tickets/:id', (req, res) => {
  const token = req.headers['x-admin-token'];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { status } = req.body;
  const { id } = req.params;

  db.run(
    "UPDATE tickets SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [status, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ success: true });
    }
  );
});

// Admin: Xóa ticket
app.delete('/api/admin/tickets/:id', (req, res) => {
  const token = req.headers['x-admin-token'];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.params;

  db.run(
    "DELETE FROM tickets WHERE id = ?",
    [id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ success: true });
    }
  );
});

// Admin: Lấy trang admin
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin.html'));
});

// Catch all 404
app.get('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`📊 Admin panel: http://localhost:${PORT}/admin`);
  console.log(`👤 Default admin: username=admin, password=admin123`);
});
