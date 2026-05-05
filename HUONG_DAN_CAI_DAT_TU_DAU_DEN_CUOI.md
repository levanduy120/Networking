# Hướng Dẫn Cài Đặt Từ Đầu Đến Cuối

Tài liệu này ghi lại toàn bộ hành trình tạo website **Duy Network Engineer Support Portal**: từ chuẩn bị máy, chạy local, đưa lên GitHub, deploy Railway, cấu hình email, đến các lỗi thường gặp và cách sửa.

## 1. Mục Tiêu Website

Website này dùng để nhận yêu cầu hỗ trợ từ khách hàng cho công việc Network Engineer:

- Khách hàng xem dịch vụ network.
- Khách hàng gửi yêu cầu hỗ trợ.
- Hệ thống tạo mã ticket dạng `NW-XXXXXXXX`.
- Khách hàng nhận email xác nhận đã tiếp nhận thông tin.
- Chủ website nhận email thông báo có ticket mới.
- Admin đăng nhập ở đường dẫn riêng `/admin` để quản lý ticket.

## 2. Công Nghệ Sử Dụng

- **Node.js + Express**: chạy backend và API.
- **SQLite**: lưu ticket, dịch vụ, admin.
- **HTML/CSS/JavaScript**: giao diện public và admin.
- **Nodemailer SMTP**: gửi email.
- **bcryptjs**: mã hóa mật khẩu admin.
- **express-rate-limit**: chống spam login và tạo ticket.
- **GitHub**: lưu source code.
- **Railway**: deploy thử nghiệm nhanh.
- **VPS**: hướng đi tiếp theo nếu muốn dùng production dài hạn.

## 3. Chuẩn Bị Trên Máy

### 3.1. Cài Node.js

Tải Node.js bản LTS từ:

```text
https://nodejs.org
```

Kiểm tra:

```bash
node -v
npm -v
```

Nếu hiện version là OK.

### 3.2. Cài Git

Tải Git từ:

```text
https://git-scm.com/downloads
```

Kiểm tra:

```bash
git --version
```

### 3.3. Cài GitHub Desktop

Tải từ:

```text
https://desktop.github.com
```

Đăng nhập tài khoản GitHub của bạn.

## 4. Cấu Trúc Dự Án

Folder hiện tại:

```text
network-engineer-portal/
├── src/
│   ├── app.js
│   ├── db/database.js
│   └── services/email.js
├── public/
│   ├── index.html
│   ├── admin.html
│   ├── css/
│   └── js/
├── data/helpdesk.db
├── setup-admins.js
├── updateServices.js
├── package.json
├── railway.json
├── .env.example
└── README.md
```

## 5. Chạy Local Lần Đầu

Vào folder dự án:

```bash
cd d:\claude-agent\network-engineer-portal
```

Cài package:

```bash
npm install
```

Tạo file `.env` từ file mẫu:

```bash
copy .env.example .env
```

Mở `.env` và chỉnh tối thiểu:

```env
NODE_ENV=development
PORT=3000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=MatKhauManhCuaBan
ADMIN_SESSION_TTL_MINUTES=120
```

Tạo admin:

```bash
node setup-admins.js
```

Chạy web:

```bash
npm start
```

Mở:

```text
http://localhost:3000
```

Admin:

```text
http://localhost:3000/admin
```

## 6. Cấu Hình Email Gmail

Email dùng cho website:

```text
levanduy120@gmail.com
```

### 6.1. Bật 2-Step Verification

Vào Google Account:

```text
https://myaccount.google.com/security
```

Bật **2-Step Verification**.

### 6.2. Tạo App Password

Vào:

```text
https://myaccount.google.com/apppasswords
```

Tạo App Password cho ứng dụng Mail. Google sẽ cho một mật khẩu 16 ký tự. Dùng mật khẩu đó cho `SMTP_PASS`.

### 6.3. Cấu Hình `.env`

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=levanduy120@gmail.com
SMTP_PASS=app_password_16_ky_tu
MAIL_FROM="Duy Network Engineer <levanduy120@gmail.com>"
OWNER_EMAIL=levanduy120@gmail.com
```

Sau đó restart server:

```bash
npm start
```

Tạo ticket thử. Nếu đúng, khách sẽ nhận email xác nhận và bạn nhận email thông báo ticket mới.

## 7. Đưa Code Lên GitHub

Repo GitHub:

```text
https://github.com/levanduy120/it-helpdesk
```

Kiểm tra remote:

```bash
git remote -v
```

Xem thay đổi:

```bash
git status
```

Commit:

```bash
git add .
git commit -m "Update network engineer portal security and email"
```

Push:

```bash
git push origin master
```

Nếu dùng GitHub Desktop:

1. Mở GitHub Desktop.
2. Chọn repository.
3. Xem danh sách file thay đổi.
4. Nhập commit message.
5. Bấm **Commit to master**.
6. Bấm **Push origin**.

## 8. Deploy Lên Railway

Project Railway:

```text
https://railway.com/project/339906c8-e826-4363-88e4-7128db223ff6
```

Public URL:

```text
https://it-helpdesk-production.up.railway.app
```

### 8.1. Deploy Từ GitHub

Trong Railway:

1. Vào project.
2. Chọn service web.
3. Vào **Settings**.
4. Kiểm tra service đã connect GitHub repo.
5. Mỗi lần push lên `master`, Railway sẽ tự build/deploy.

### 8.2. Cấu Hình Railway Variables

Vào Railway project -> service -> **Variables**.

Thêm:

```env
NODE_ENV=production
PORT=3000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=MatKhauManhProduction
ADMIN_SESSION_TTL_MINUTES=120
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=levanduy120@gmail.com
SMTP_PASS=app_password_16_ky_tu
MAIL_FROM="Duy Network Engineer <levanduy120@gmail.com>"
OWNER_EMAIL=levanduy120@gmail.com
```

Không đưa `SMTP_PASS` hoặc `ADMIN_PASSWORD` lên GitHub.

### 8.3. Tạo Admin Trên Railway

Nếu Railway có shell/terminal:

```bash
node setup-admins.js
```

Nếu không có shell, có thể deploy một lần với biến `ADMIN_USERNAME` và `ADMIN_PASSWORD`, sau đó chạy lệnh qua Railway CLI:

```bash
railway run node setup-admins.js
```

## 9. Kiểm Tra Sau Deploy

Mở website:

```text
https://it-helpdesk-production.up.railway.app
```

Checklist:

- Trang chủ không còn nút Admin.
- Footer hiển thị `levanduy120@gmail.com`.
- Tạo ticket thành công.
- Mã ticket có dạng `NW-XXXXXXXX`.
- Khách nhận email xác nhận.
- Bạn nhận email thông báo ticket mới.
- Vào `/admin` đăng nhập được.
- Admin xem được ticket và đổi trạng thái.

## 10. Chuẩn Bị Khi Chuyển Sang VPS

Khi dùng VPS, nên dùng:

- Ubuntu Server 22.04 hoặc 24.04.
- Node.js LTS.
- PM2 để chạy app nền.
- Nginx reverse proxy.
- SSL từ Let's Encrypt.
- Backup database định kỳ.

Luồng VPS cơ bản:

```bash
git clone https://github.com/levanduy120/it-helpdesk.git
cd it-helpdesk
npm install --omit=dev
cp .env.example .env
nano .env
node setup-admins.js
npm install -g pm2
pm2 start src/app.js --name network-engineer-portal
pm2 save
pm2 startup
```

Nginx reverse proxy trỏ domain về port app:

```nginx
server {
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

SSL:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 11. Lỗi Thường Gặp Và Cách Fix

### Lỗi 1: `npm.ps1 cannot be loaded because running scripts is disabled`

Nguyên nhân: PowerShell chặn file script `.ps1`.

Fix nhanh:

```bash
npm.cmd install
npm.cmd start
```

Hoặc dùng CMD/Git Bash thay vì PowerShell.

### Lỗi 2: `Unable to connect to the remote server`

Nguyên nhân:

- Server chưa chạy.
- Sai port.
- App crash khi khởi động.

Fix:

```bash
npm start
```

Kiểm tra port trong `.env`:

```env
PORT=3000
```

Mở đúng:

```text
http://localhost:3000
```

### Lỗi 3: Không gửi được email Gmail

Nguyên nhân thường gặp:

- Dùng mật khẩu Gmail thường thay vì App Password.
- Chưa bật 2-Step Verification.
- Sai `SMTP_USER` hoặc `SMTP_PASS`.
- Copy app password bị dư khoảng trắng.

Fix:

1. Bật 2-Step Verification.
2. Tạo App Password.
3. Cập nhật `SMTP_PASS`.
4. Restart app.

### Lỗi 4: Tạo ticket được nhưng không nhận email

Nguyên nhân:

- SMTP chưa cấu hình.
- Email bị vào Spam.
- Railway Variables chưa được deploy lại.

Fix:

- Kiểm tra Railway Variables.
- Redeploy service.
- Kiểm tra logs Railway.
- Tìm email trong Spam/Promotions.

### Lỗi 5: Đăng nhập admin báo sai mật khẩu

Nguyên nhân:

- Chưa chạy `node setup-admins.js`.
- Railway chưa có `ADMIN_PASSWORD`.
- Mật khẩu trong DB cũ khác mật khẩu bạn đang nhập.

Fix:

```bash
node setup-admins.js
```

Trên Railway:

```bash
railway run node setup-admins.js
```

### Lỗi 6: Trang chủ vẫn hiện service cũ

Nguyên nhân:

- Database SQLite đã có dữ liệu cũ nên seed mới không tự insert lại.

Fix:

Chạy:

```bash
node updateServices.js
```

Hoặc sửa trực tiếp trong admin console phần dịch vụ.

### Lỗi 7: Railway deploy xong nhưng mất dữ liệu ticket

Nguyên nhân:

- Chưa mount Railway Volume cho `data/helpdesk.db`.
- SQLite nằm trong filesystem tạm của container.

Fix:

- Tạo Railway Volume.
- Mount vào đường dẫn app lưu DB.
- Backup database định kỳ.

### Lỗi 8: `SQLITE_BUSY`

Nguyên nhân:

- SQLite bị lock khi có nhiều request cùng lúc.

Fix ngắn hạn:

- Giảm thao tác đồng thời.
- Restart app nếu bị lock lâu.

Fix dài hạn:

- Khi lên production thật, cân nhắc PostgreSQL thay SQLite.

### Lỗi 9: `npm audit` báo lỗi high

Nguyên nhân:

- Một số cảnh báo đến từ dependency transitive của `sqlite3/node-gyp/tar`.

Hiện tại app không xử lý upload/archive nên rủi ro thấp hơn, nhưng không nên bỏ qua khi production.

Fix dài hạn:

- Theo dõi bản update `sqlite3`.
- Cân nhắc chuyển sang PostgreSQL trên VPS hoặc Railway.

### Lỗi 10: Git push thất bại do authentication

Nguyên nhân:

- GitHub credential hết hạn.
- GitHub CLI chưa login.
- GitHub Desktop chưa đăng nhập.

Fix với GitHub Desktop:

1. Mở GitHub Desktop.
2. Sign out rồi sign in lại.
3. Bấm Push origin.

Fix với Git CLI:

```bash
gh auth login
git push origin master
```

### Lỗi 11: Railway không tự deploy sau khi push

Nguyên nhân:

- Railway chưa connect đúng repo/branch.
- GitHub integration mất quyền.
- Deploy bị lỗi build.

Fix:

- Vào Railway -> Deployments xem log.
- Kiểm tra branch deploy là `master`.
- Reconnect GitHub repo nếu cần.
- Bấm Redeploy.

## 12. Quy Trình Mỗi Lần Update Website

1. Sửa code local.
2. Chạy local test:

```bash
npm start
```

3. Commit:

```bash
git add .
git commit -m "Mô tả thay đổi"
```

4. Push:

```bash
git push origin master
```

5. Vào Railway xem deploy.
6. Test website live.

## 13. Checklist Production Trước Khi Dùng Thật

- [ ] Đổi toàn bộ password admin cũ.
- [ ] Không có password trong README/tài liệu.
- [ ] Railway Variables có `ADMIN_PASSWORD` và `SMTP_PASS`.
- [ ] Tạo ticket test thành công.
- [ ] Email khách nhận được.
- [ ] Email chủ site nhận được.
- [ ] Admin console không link từ trang chủ.
- [ ] Database có volume/backup.
- [ ] Có domain riêng.
- [ ] Có uptime monitoring.
- [ ] Có kế hoạch chuyển PostgreSQL/VPS nếu traffic tăng.
