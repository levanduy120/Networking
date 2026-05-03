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
        { name: 'Network Infrastructure Setup', description: 'Thiết kế, triển khai hạ tầng mạng enterprise' },
        { name: 'Network Maintenance & Support', description: 'Bảo trì, hỗ trợ mạng 24/7' },
        { name: 'Security & Firewall', description: 'Cấu hình firewall, VPN, bảo mật mạng' },
        { name: 'Wireless Solution', description: 'Giải pháp WiFi, mesh network, cấp phát IP' },
        { name: 'Office Helpdesk', description: 'Hỗ trợ user, máy tính, máy in, phần mềm' },
        { name: 'IT Consulting', description: 'Tư vấn giải pháp IT, lên kế hoạch nâng cấp cơ sở hạ tầng' },
        { name: 'Remote Support', description: 'Hỗ trợ từ xa qua RDP, TeamViewer' },
        { name: 'Network Monitoring', description: 'Giám sát mạng, báo cáo hiệu suất' },
        { name: 'Cabling & Hardware', description: 'Lắp đặt dây cáp, switch, router, cấp phát PoE' },
        { name: 'System Administration', description: 'Quản lý server, backup, disaster recovery' }
      ];

      services.forEach(service => {
        db.run(
          "INSERT INTO services (name, description) VALUES (?, ?)",
          [service.name, service.description]
        );
      });
    }
  });

  // Thêm admin user mặc định KHÔNG LÀM NAY - dùng setup-admins.js thay
  // Khi production setup, tất cả user được thêm qua setup-admins.js
  db.get("SELECT COUNT(*) as count FROM admin_users", (err, row) => {
    if (row && row.count === 0) {
      // KHÔNG insert default user - yêu cầu chạy setup-admins.js
      console.log('⚠️  No admin users found. Please run: node setup-admins.js');
    }
  });
});

module.exports = db;
