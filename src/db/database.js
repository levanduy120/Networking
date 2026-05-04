const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'helpdesk.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Bảng services
  db.run(`CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT 'desktop',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Bảng tickets
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

  // Bảng admin_users
  db.run(`CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Seed services nếu chưa có
  db.get('SELECT COUNT(*) as count FROM services', (err, row) => {
    if (!err && row.count === 0) {
      const services = [
        ['Network Infrastructure Setup', 'Thiết kế, triển khai hạ tầng mạng enterprise', 'desktop'],
        ['Network Maintenance & Support', 'Bảo trì, hỗ trợ mạng 24/7', 'desktop'],
        ['Security & Firewall', 'Cấu hình firewall, VPN, bảo mật mạng', 'desktop'],
        ['Wireless Solution', 'Giải pháp WiFi, mesh network, cấp phát IP', 'desktop'],
        ['Office Helpdesk', 'Hỗ trợ user, máy tính, máy in, phần mềm', 'desktop'],
        ['IT Consulting', 'Tư vấn giải pháp IT, lên kế hoạch nâng cấp cơ sở hạ tầng', 'desktop'],
        ['Remote Support', 'Hỗ trợ từ xa qua RDP, TeamViewer', 'desktop'],
        ['Network Monitoring', 'Giám sát mạng, báo cáo hiệu suất', 'desktop'],
        ['Cabling & Hardware', 'Lắp đặt dây cáp, switch, router, cấp phát PoE', 'desktop'],
        ['System Administration', 'Quản lý server, backup, disaster recovery', 'desktop'],
      ];
      const stmt = db.prepare('INSERT INTO services (name, description, icon) VALUES (?, ?, ?)');
      services.forEach(s => stmt.run(s));
      stmt.finalize();
    }
  });

  // Seed admin users — luôn đảm bảo tồn tại sau mỗi lần deploy
  const admins = [
    ['admin',  'DuyNetwork@2026'],
    ['admin1', 'HelpDesk@2026_Admin1'],
    ['admin2', 'HelpDesk@2026_Admin2'],
    ['admin3', 'HelpDesk@2026_Admin3'],
    ['admin4', 'HelpDesk@2026_Admin4'],
    ['admin5', 'HelpDesk@2026_Admin5'],
  ];

  admins.forEach(([username, password]) => {
    db.run(
      `INSERT INTO admin_users (username, password) VALUES (?, ?)
       ON CONFLICT(username) DO UPDATE SET password = excluded.password`,
      [username, password]
    );
  });
});

module.exports = db;
