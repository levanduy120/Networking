# Duy Network Engineer Support Portal

Portal nhận yêu cầu hỗ trợ network engineering cho khách hàng/doanh nghiệp.

## Tính năng

- Trang public giới thiệu dịch vụ network engineering.
- Khách hàng gửi yêu cầu hỗ trợ và nhận mã ticket.
- Khách hàng tra cứu trạng thái bằng mã ticket.
- Email xác nhận gửi cho khách hàng sau khi tạo ticket.
- Email thông báo ticket mới gửi cho kỹ sư phụ trách.
- Secure Console tại `/admin` để quản lý ticket, trạng thái và dịch vụ.
- Mật khẩu admin được lưu bằng bcrypt, không lưu plain text.
- Rate limit cho đăng nhập admin và tạo ticket.

## Công nghệ

- Backend: Node.js + Express
- Database: SQLite
- Frontend: HTML + CSS + Vanilla JavaScript
- Email: Nodemailer SMTP
- Deploy: Railway

## Cài đặt local

```bash
npm install
cp .env.example .env
npm start
```

Website chạy tại `http://localhost:3000`.

Admin console chạy tại `http://localhost:3000/admin`. Đường admin đã được ẩn khỏi trang chủ để tránh lộ link quản trị.

## Tạo hoặc đổi admin

Thêm biến môi trường vào `.env`:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_strong_password_here
```

Sau đó chạy:

```bash
node setup-admins.js
```

Script sẽ tạo/cập nhật admin và lưu mật khẩu bằng bcrypt.

## Cấu hình email SMTP

Thêm các biến sau trong `.env` local hoặc Railway Variables:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=levanduy120@gmail.com
SMTP_PASS=your_app_password
MAIL_FROM="Duy Network Engineer <levanduy120@gmail.com>"
OWNER_EMAIL=levanduy120@gmail.com
```

Với Gmail, dùng App Password thay cho mật khẩu Gmail thường.

Khi SMTP chưa được cấu hình, hệ thống vẫn tạo ticket bình thường và chỉ bỏ qua bước gửi email.

## Deploy Railway

Railway tự chạy:

```bash
npm start
```

Sau khi push lên GitHub, Railway sẽ build lại. Nhớ cấu hình các Railway Variables tương tự `.env.example`, đặc biệt là SMTP và admin password.

## Ghi chú bảo mật

- Không commit file `.env`.
- Không đưa mật khẩu admin vào README, tài liệu bàn giao, hoặc source code.
- Nên đổi toàn bộ mật khẩu admin cũ vì credentials trước đây từng nằm trong repo.
- Nên backup `data/helpdesk.db` định kỳ nếu dùng SQLite trên Railway Volume.

## Tài liệu chi tiết

Xem hướng dẫn đầy đủ từ lúc tạo website đến deploy, cấu hình email, Railway, VPS và lỗi thường gặp tại:

[HUONG_DAN_CAI_DAT_TU_DAU_DEN_CUOI.md](HUONG_DAN_CAI_DAT_TU_DAU_DEN_CUOI.md)
