const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Tạo thư mục data nếu chưa có
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Tạo kết nối đến database
const dbPath = path.join(dataDir, 'helpdesk.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('✅ Connected to SQLite database at:', dbPath);
  }
});

// Tạo các bảng
db.serialize(() => {
  // Bảng Dịch vụ
  db.run(`
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      icon TEXT DEFAULT 'desktop',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Bảng Ticket
  db.run(`
    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_code TEXT NOT NULL UNIQUE,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT,
      service_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      priority TEXT DEFAULT 'medium',
      status TEXT DEFAULT 'open',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (service_id) REFERENCES services(id)
    )
  `);

  // Bảng Admin User
  db.run(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Thêm dữ liệu mẫu nếu bảng trống
  db.get("SELECT COUNT(*) as count FROM services", (err, row) => {
    if (row && row.count === 0) {
      const services = [
        { name: 'Network Support', description: 'Hỗ trợ mạng, WiFi, VPN' },
        { name: 'Hardware Support', description: 'Sửa chữa máy tính, máy in' },
        { name: 'Software Support', description: 'Hỗ trợ phần mềm, license' },
        { name: 'Email Support', description: 'Cấu hình email, hỗ trợ Outlook' },
        { name: 'User Training', description: 'Đào tạo sử dụng phần mềm' }
      ];

      services.forEach(service => {
        db.run(
          "INSERT INTO services (name, description) VALUES (?, ?)",
          [service.name, service.description]
        );
      });
    }
  });

  // Thêm admin user mặc định (username: admin, password: admin123)
  db.get("SELECT COUNT(*) as count FROM admin_users", (err, row) => {
    if (row && row.count === 0) {
      db.run(
        "INSERT INTO admin_users (username, password) VALUES (?, ?)",
        ['admin', 'admin123'] // Trong production cần hash password
      );
    }
  });
});

module.exports = db;
