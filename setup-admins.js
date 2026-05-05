#!/usr/bin/env node
require('dotenv').config();
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'data', 'helpdesk.db');
const db = new sqlite3.Database(dbPath);

const username = process.env.ADMIN_USERNAME || 'admin';
const password = process.env.ADMIN_PASSWORD;

if (!password || password.length < 8) {
  console.error('ADMIN_PASSWORD is required and must be at least 8 characters.');
  console.error('Example: ADMIN_USERNAME=admin ADMIN_PASSWORD=your_strong_password node setup-admins.js');
  process.exit(1);
}

const passwordHash = bcrypt.hashSync(password, 12);

console.log('Setting up admin user...');

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  );

  db.run(
    `INSERT INTO admin_users (username, password)
     VALUES (?, ?)
     ON CONFLICT(username) DO UPDATE SET password = excluded.password`,
    [username, passwordHash],
    function(err) {
      if (err) {
        console.error('Failed to create/update admin:', err.message);
        db.close();
        process.exit(1);
      }

      console.log(`Admin user is ready: ${username}`);
      console.log('Password was stored as a bcrypt hash.');
      db.close();
    }
  );
});
