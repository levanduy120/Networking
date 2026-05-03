-- ============ CẬP NHẬT DỊCH VỤ CHO DUY NETWORK ============

-- Xóa dịch vụ cũ
DELETE FROM services;

-- Thêm dịch vụ mới của Duy Network
INSERT INTO services (name, description) VALUES
('Network Infrastructure Setup', 'Thiết kế, triển khai hạ tầng mạng enterprise'),
('Network Maintenance & Support', 'Bảo trì, hỗ trợ mạng 24/7'),
('Wireless Solution', 'Giải pháp WiFi, mesh network, cấp phát IP'),
('Security & Firewall', 'Cấu hình firewall, VPN, bảo mật mạng'),
('Network Monitoring', 'Giám sát mạng, báo cáo hiệu suất'),
('Cabling & Hardware', 'Lắp đặt dây cáp, switch, router, cấp phát PoE'),
('Remote Support', 'Hỗ trợ từ xa qua RDP, TeamViewer'),
('Office Helpdesk', 'Hỗ trợ user, máy tính, máy in, phần mềm'),
('IT Consulting', 'Tư vấn giải pháp IT, lên kế hoạch nâng cấp'),
('System Administration', 'Quản lý server, backup, disaster recovery');

-- Kiểm tra dữ liệu
SELECT * FROM services;
