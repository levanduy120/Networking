const db = require('./src/db/database');

const newServices = [
  { name: 'Network Infrastructure Setup', description: 'Thiết kế, triển khai hạ tầng mạng enterprise' },
  { name: 'Network Maintenance & Support', description: 'Bảo trì, hỗ trợ mạng 24/7' },
  { name: 'Security & Firewall', description: 'Cấu hình firewall, VPN, bảo mật mạng' },
  { name: 'Wireless Solution', description: 'Giải pháp WiFi, mesh network, cấp phát IP' },
  { name: 'Office Endpoint Support', description: 'Hỗ trợ user, máy tính, máy in, phần mềm văn phòng' },
  { name: 'Network Consulting', description: 'Tư vấn kiến trúc mạng, nâng cấp hạ tầng và chuẩn hóa vận hành' },
  { name: 'Remote Support', description: 'Hỗ trợ từ xa qua RDP, TeamViewer' },
  { name: 'Network Monitoring', description: 'Giám sát mạng, cảnh báo và báo cáo hiệu suất' },
  { name: 'Cabling & Hardware', description: 'Lắp đặt dây cáp, switch, router, cấp phát PoE' },
  { name: 'System Administration', description: 'Quản lý server, backup, disaster recovery' }
];

console.log('Đang cập nhật dịch vụ network...');

db.serialize(() => {
  db.run('DELETE FROM services');

  const stmt = db.prepare('INSERT INTO services (name, description, icon) VALUES (?, ?, ?)');
  newServices.forEach(service => {
    stmt.run(service.name, service.description, 'desktop');
  });
  stmt.finalize(err => {
    if (err) {
      console.error('Lỗi cập nhật dịch vụ:', err.message);
      process.exit(1);
      return;
    }

    console.log('Cập nhật dịch vụ hoàn tất.');
    db.close();
  });
});
