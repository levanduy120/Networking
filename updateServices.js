// Script cập nhật dịch vụ cho Duy Network
const db = require('./src/db/database');

const newServices = [
  { name: 'Network Infrastructure Setup', description: 'Thiết kế, triển khai hạ tầng mạng enterprise' },
  { name: 'Network Maintenance & Support', description: 'Bảo trì, hỗ trợ mạng 24/7' },
  { name: 'Wireless Solution', description: 'Giải pháp WiFi, mesh network, cấp phát IP' },
  { name: 'Security & Firewall', description: 'Cấu hình firewall, VPN, bảo mật mạng' },
  { name: 'Network Monitoring', description: 'Giám sát mạng, báo cáo hiệu suất' },
  { name: 'Cabling & Hardware', description: 'Lắp đặt dây cáp, switch, router, cấp phát PoE' },
  { name: 'Remote Support', description: 'Hỗ trợ từ xa qua RDP, TeamViewer' },
  { name: 'Office Helpdesk', description: 'Hỗ trợ user, máy tính, máy in, phần mềm' },
  { name: 'IT Consulting', description: 'Tư vấn giải pháp IT, lên kế hoạch nâng cấp' },
  { name: 'System Administration', description: 'Quản lý server, backup, disaster recovery' }
];

console.log('🔄 Đang cập nhật dịch vụ...');

// Xóa dịch vụ cũ
db.run('DELETE FROM services', (err) => {
  if (err) {
    console.error('❌ Lỗi xóa dịch vụ:', err);
    return;
  }

  // Thêm dịch vụ mới
  let count = 0;
  newServices.forEach(service => {
    db.run(
      'INSERT INTO services (name, description) VALUES (?, ?)',
      [service.name, service.description],
      (err) => {
        if (err) {
          console.error('❌ Lỗi thêm dịch vụ:', err);
        } else {
          count++;
          console.log(`✅ Thêm: ${service.name}`);
        }

        if (count === newServices.length) {
          console.log('\n✅ Cập nhật dịch vụ hoàn tất!');
          console.log('🔄 Vui lòng làm mới website (F5)');
          process.exit(0);
        }
      }
    );
  });
});
