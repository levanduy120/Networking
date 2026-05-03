#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, 'data', 'helpdesk.db');
const db = new sqlite3.Database(dbPath);

// 5 admin users mới + mật khẩu mạnh
const admins = [
  { username: 'admin1', password: 'HelpDesk@2024_Admin1' },
  { username: 'admin2', password: 'HelpDesk@2024_Admin2' },
  { username: 'admin3', password: 'HelpDesk@2024_Admin3' },
  { username: 'admin4', password: 'HelpDesk@2024_Admin4' },
  { username: 'admin5', password: 'HelpDesk@2024_Admin5' },
];

// Đổi password admin mặc định
const newAdminPassword = 'DuyNetwork@Admin2024';

console.log('🔧 Bắt đầu setup admin users...\n');

db.serialize(() => {
  // 1. Đổi password admin mặc định
  db.run(
    "UPDATE admin_users SET password = ? WHERE username = 'admin'",
    [newAdminPassword],
    function(err) {
      if (err) {
        console.error('❌ Lỗi đổi password admin:', err.message);
      } else {
        console.log('✅ Đổi password admin mặc định:');
        console.log(`   Username: admin`);
        console.log(`   Password: ${newAdminPassword}\n`);
      }
    }
  );

  // 2. Thêm 5 admin users mới
  admins.forEach((user, idx) => {
    db.run(
      "INSERT INTO admin_users (username, password) VALUES (?, ?)",
      [user.username, user.password],
      function(err) {
        if (err) {
          console.error(`❌ Lỗi thêm ${user.username}:`, err.message);
        } else {
          console.log(`✅ Thêm user ${idx + 1}/5:`);
          console.log(`   Username: ${user.username}`);
          console.log(`   Password: ${user.password}\n`);
        }
      }
    );
  });

  // 3. Verify
  setTimeout(() => {
    db.all("SELECT username FROM admin_users", [], (err, rows) => {
      console.log('\n📋 Toàn bộ admin users hiện có:');
      rows?.forEach(row => console.log(`   - ${row.username}`));
      console.log('\n✅ Setup hoàn tất!');
      db.close();
      process.exit(0);
    });
  }, 1000);
});
