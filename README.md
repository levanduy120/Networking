# IT Helpdesk Support System

Một hệ thống quản lý yêu cầu hỗ trợ IT đơn giản, dễ sử dụng và dễ quản lý.

## ✨ Tính Năng

- 🌐 **Trang chủ đẹp** - Giới thiệu dịch vụ hỗ trợ IT
- 🎫 **Tạo Ticket** - Khách hàng có thể tạo yêu cầu hỗ trợ
- 🔍 **Theo dõi Ticket** - Kiểm tra trạng thái yêu cầu bằng mã ticket
- 👨‍💼 **Admin Panel** - Quản lý tất cả tickets, cập nhật trạng thái
- 📊 **Dashboard** - Xem thống kê tổng quan

## 🛠️ Công Nghệ

- **Backend**: Node.js + Express
- **Database**: SQLite
- **Frontend**: HTML + CSS + Vanilla JavaScript
- **Hosting**: Có thể deploy trên Heroku, Railway, VPS

## 📦 Cài Đặt

### 1. Cài Node.js
Tải từ: https://nodejs.org/

### 2. Clone/Download Project
```bash
cd it-helpdesk
```

### 3. Cài Dependencies
```bash
npm install
```

### 4. Chạy Server
```bash
npm start
```

Server sẽ chạy tại: `http://localhost:3000`

## 🚀 Sử Dụng

### Trang Chủ (http://localhost:3000)
- Xem danh sách dịch vụ hỗ trợ
- Tạo ticket mới
- Theo dõi ticket bằng mã ticket code

### Admin Panel (http://localhost:3000/admin)
**Đăng nhập:**
- Username: `admin`
- Password: `admin123`

**Chức năng:**
- 📊 Dashboard: Xem tổng quan tickets
- 🎫 Tickets: Quản lý tất cả tickets
  - Xem chi tiết ticket
  - Cập nhật trạng thái (Mở → Đang xử lý → Đóng)
  - Xóa ticket

## 📁 Cấu Trúc Project

```
it-helpdesk/
├── src/
│   ├── app.js              # Server chính
│   ├── db/
│   │   └── database.js     # Setup database
│   └── routes/
├── public/
│   ├── index.html          # Trang chủ
│   ├── admin.html          # Admin panel
│   ├── css/
│   │   ├── style.css       # CSS trang chủ
│   │   └── admin.css       # CSS admin
│   └── js/
│       ├── main.js         # JavaScript trang chủ
│       └── admin.js        # JavaScript admin
├── data/
│   └── helpdesk.db         # SQLite database
├── package.json
└── README.md
```

## 🔐 Bảo Mật

⚠️ **Lưu ý:** Đây là version demo. Trước khi deploy lên production:

1. **Thay đổi password admin**:
   - Mở file `src/db/database.js`
   - Tìm dòng: `db.run("INSERT INTO admin_users (username, password) VALUES (?, ?)", ['admin', 'admin123']`
   - Thay `admin123` bằng password mạnh

2. **Hash Password**: 
   - Cài bcryptjs: `npm install bcryptjs`
   - Sử dụng bcrypt để hash password (xem phần Security Enhancement)

3. **Sử dụng HTTPS**

4. **Thêm xác thực JWT**

## 📝 Các Dịch Vụ Mặc Định

- Network Support - Hỗ trợ mạng, WiFi, VPN
- Hardware Support - Sửa chữa máy tính, máy in
- Software Support - Hỗ trợ phần mềm, license
- Email Support - Cấu hình email, Outlook
- User Training - Đào tạo sử dụng phần mềm

## 🚀 Deploy Lên Production

### Option 1: Heroku
```bash
# Cài Heroku CLI
# Login
heroku login

# Tạo app
heroku create your-app-name

# Deploy
git push heroku main
```

### Option 2: Railway (Recommend)
1. Đăng ký tại railway.app
2. Connect GitHub repo
3. Deploy

### Option 3: VPS (DigitalOcean, Linode)
1. SSH vào server
2. Cài Node.js
3. Clone project
4. `npm install && npm start`
5. Dùng PM2 để keep server chạy: `npm install -g pm2 && pm2 start src/app.js`

## 📞 Support

Nếu gặp lỗi, kiểm tra:
- Node.js version (>= 14.0)
- Port 3000 có bị chiếm không
- SQLite có được install không

## 📄 License

MIT

---

✍️ Tạo bởi Claude Copilot
