const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const dataDir = process.env.DATABASE_DIR || process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'helpdesk.db');
console.log(`Using SQLite database: ${dbPath}`);
const db = new sqlite3.Database(dbPath);

const defaultServices = [
  ['Network Infrastructure Setup', 'Thiết kế VLAN, IP plan, gateway, switch core/access và kết nối Internet cho văn phòng.', 'desktop'],
  ['Network Maintenance & Support', 'Bảo trì định kỳ, kiểm tra cấu hình, backup thiết bị và hỗ trợ sự cố mạng doanh nghiệp.', 'desktop'],
  ['Security & Firewall', 'Cấu hình firewall policy, NAT, VPN, phân vùng mạng và rà soát rule bảo mật.', 'desktop'],
  ['Wireless Solution', 'Thiết kế WiFi văn phòng, SSID, roaming, guest network, VLAN mapping và tối ưu vùng phủ.', 'desktop'],
  ['Office Endpoint Support', 'Hỗ trợ máy tính, máy in, phần mềm văn phòng, email client và kết nối mạng người dùng.', 'desktop'],
  ['Network Consulting', 'Tư vấn kiến trúc mạng, chuẩn hóa sơ đồ, tài liệu vận hành và kế hoạch nâng cấp hạ tầng.', 'desktop'],
  ['Remote Support', 'Hỗ trợ từ xa qua AnyDesk, RDP, VPN hoặc video call để xử lý lỗi nhanh.', 'desktop'],
  ['Network Monitoring', 'Giám sát uptime, latency, băng thông, cảnh báo sự cố và báo cáo sức khỏe hệ thống.', 'desktop'],
  ['Cabling & Hardware', 'Tư vấn/lắp đặt dây mạng, tủ rack, patch panel, switch, router, AP và thiết bị PoE.', 'desktop'],
  ['System Administration', 'Hỗ trợ server, user account, backup, chia sẻ file, kiểm tra log và khôi phục cơ bản.', 'desktop']
];

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT 'desktop',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_code TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    service_id INTEGER,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'open',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE INDEX IF NOT EXISTS idx_tickets_code ON tickets(ticket_code)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_tickets_created ON tickets(created_at)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_admin_username ON admin_users(username)`);

  db.get('SELECT COUNT(*) as count FROM services', (err, row) => {
    if (!err && row.count === 0) {
      const stmt = db.prepare('INSERT INTO services (name, description, icon) VALUES (?, ?, ?)');
      defaultServices.forEach(service => stmt.run(service));
      stmt.finalize();
    }
  });

  defaultServices.forEach(([name, description, icon]) => {
    db.run(
      'UPDATE services SET description = ?, icon = ? WHERE name = ?',
      [description, icon, name]
    );
  });

  db.run(
    `UPDATE services
     SET name = ?, description = ?
     WHERE name = ?`,
    [
      'Office Endpoint Support',
      'Hỗ trợ user, máy tính, máy in, phần mềm văn phòng',
      'Office Helpdesk'
    ]
  );

  db.run(
    `UPDATE services
     SET name = ?, description = ?
     WHERE name = ?`,
    [
      'Network Consulting',
      'Tư vấn kiến trúc mạng, nâng cấp hạ tầng và chuẩn hóa vận hành',
      'IT Consulting'
    ]
  );

  db.get('SELECT COUNT(*) as count FROM admin_users', (err, row) => {
    if (!err && row.count === 0) {
      console.log('No admin users found.');
    }
  });

  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminPassword && adminPassword.length >= 8) {
    const passwordHash = bcrypt.hashSync(adminPassword, 12);
    db.run(
      `INSERT INTO admin_users (username, password)
       VALUES (?, ?)
       ON CONFLICT(username) DO UPDATE SET password = excluded.password`,
      [adminUsername, passwordHash],
      (adminErr) => {
        if (adminErr) {
          console.error('Admin setup failed:', adminErr.message);
          return;
        }
        console.log(`Admin user is ready: ${adminUsername}`);
      }
    );
  } else {
    console.warn('ADMIN_PASSWORD is missing or shorter than 8 characters. Admin login is disabled until it is set.');
  }
});

module.exports = db;
