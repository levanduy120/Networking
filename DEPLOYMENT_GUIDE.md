# 🚀 HƯỚNG DẪN DEPLOY DUY NETWORK HELPDESK

> **Stack:** Node.js + Express + SQLite | **Port mặc định:** 3000

---

## 📋 MỤC LỤC

1. [So sánh Railway vs VPS](#-so-sánh-railway-vs-vps)
2. [OPTION A: Railway (Nhanh, Dễ)](#-option-a-railway-nhanh-dễ)
3. [OPTION B: VPS DigitalOcean (Kiểm Soát Đầy Đủ)](#-option-b-vps-digitalocean)
4. [Đổi Mật Khẩu Admin Sau Deploy](#-đổi-mật-khẩu-admin)
5. [Troubleshoot](#-troubleshoot)

---

## 📊 So Sánh Railway vs VPS

| Tiêu Chí | Railway | VPS |
|---------|---------|-----|
| **Thời gian setup** | ~10 phút | ~45 phút |
| **Độ khó** | Dễ | Trung bình |
| **Chi phí** | $5/tháng (Hobby) | $6/tháng (DigitalOcean) |
| **Kiểm soát** | Giới hạn | Toàn quyền |
| **SSL/HTTPS** | Tự động | Cần tự setup (Certbot) |
| **Custom domain** | Có | Có |
| **Database** | ⚠️ Cần Volume (xem bên dưới) | ✅ File local trên server |
| **Phù hợp** | Demo, prototype | Production thực tế |

> ⚠️ **Lưu ý SQLite trên Railway:** Mỗi lần Railway redeploy, container reset, data SQLite **sẽ bị mất** trừ khi bạn mount Railway Volume. VPS thì không bị vấn đề này.

**→ Khuyến nghị:** Dùng **VPS** nếu muốn production thực sự. Dùng **Railway** nếu chỉ demo/test.

---

## ☁️ OPTION A: Railway (Nhanh, Dễ)

### Bước 1: Chuẩn Bị GitHub Repository

Mở **PowerShell** trên máy Windows, chạy từng lệnh:

```powershell
# Di chuyển vào thư mục project
cd d:\claude-agent\it-helpdesk

# Khởi tạo Git
git init
git add .
git commit -m "Initial commit - Duy Network Helpdesk"
```

Tạo repo trên GitHub:
1. Vào [github.com](https://github.com) → Đăng nhập
2. Click **New repository** (nút xanh góc phải)
3. Tên repo: `it-helpdesk`
4. Chọn **Private**
5. **KHÔNG** tick "Add README"
6. Click **Create repository**
7. Copy URL repo dạng: `https://github.com/TEN_BAN/it-helpdesk.git`

```powershell
# Kết nối với GitHub (thay URL bằng URL của bạn)
git remote add origin https://github.com/TEN_BAN/it-helpdesk.git
git branch -M main
git push -u origin main
```

---

### Bước 2: Deploy Lên Railway

**Cách 1: Qua Website (Dễ nhất)**

1. Vào [railway.app](https://railway.app) → **Start a New Project**
2. Đăng nhập bằng GitHub
3. Click **Deploy from GitHub repo**
4. Chọn repo `it-helpdesk`
5. Railway tự detect Node.js và deploy
6. Chờ ~2 phút → nhận URL dạng `xxx.up.railway.app`

**Cách 2: Railway CLI**

```powershell
# Cài Railway CLI
npm install -g @railway/cli

# Đăng nhập (mở browser tự động)
railway login

# Tạo project và deploy
cd d:\claude-agent\it-helpdesk
railway init
railway up

# Lấy URL public
railway open
```

---

### Bước 3: Thêm Persistent Volume (QUAN TRỌNG - Giữ Data)

Nếu không làm bước này, data sẽ mất mỗi lần redeploy!

1. Vào Railway Dashboard → chọn service của bạn
2. Tab **Volumes** → **Add Volume**
3. **Mount Path:** `/app/data`
4. Click **Create**
5. Redeploy: Railway Dashboard → **Deploy** → **Redeploy**

---

### Bước 4: Gắn Custom Domain

1. Railway Dashboard → Service → Tab **Settings**
2. Phần **Networking** → **Custom Domain**
3. Nhập domain (vd: `helpdesk.dunetwork.vn`)
4. Railway hiện DNS record cần thêm, ví dụ:
   ```
   Type: CNAME
   Name: helpdesk
   Value: xxx.railway.app
   ```
5. Vào nhà cung cấp domain → DNS Settings → Thêm record
6. Chờ 5-30 phút DNS propagate
7. Railway tự cấp SSL certificate

---

### Bước 5: Set Environment Variables

Railway Dashboard → Service → Tab **Variables** → Add:

```
NODE_ENV=production
PORT=3000
```

---

## 🖥️ OPTION B: VPS DigitalOcean

### Bước 1: Tạo VPS (Droplet)

1. Đăng ký tài khoản: [digitalocean.com](https://www.digitalocean.com)
   - Cần thẻ Visa/Mastercard (tặng $200 credit 60 ngày nếu dùng link referral)

2. Click **Create** → **Droplets**

3. Chọn cấu hình:
   - **Region:** Singapore (gần VN nhất)
   - **OS:** Ubuntu 24.04 LTS x64
   - **Plan:** Basic → **Regular** → **$6/month** (1 vCPU, 1GB RAM, 25GB SSD)
   - **Authentication:** Password (nhập mật khẩu root) hoặc SSH Key

4. **Hostname:** `duy-helpdesk`
5. Click **Create Droplet**
6. **Lưu lại IP VPS** (vd: `178.62.123.45`)

---

### Bước 2: SSH Vào Server

Mở **PowerShell** trên Windows:

```powershell
ssh root@178.62.123.45
```
*(Thay IP bằng IP VPS của bạn)*

Nhập mật khẩu root khi được hỏi.

---

### Bước 3: Cài Đặt Môi Trường

Chạy từng block lệnh sau (copy-paste vào terminal SSH):

```bash
# Cập nhật hệ thống
apt update && apt upgrade -y

# Cài Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Kiểm tra phiên bản
node --version   # phải ra v20.x.x
npm --version    # phải ra 10.x.x

# Cài Git
apt install -y git

# Cài Nginx (reverse proxy - đứng trước Node.js nhận traffic port 80/443)
apt install -y nginx

# Cài Certbot (SSL miễn phí từ Let's Encrypt)
apt install -y certbot python3-certbot-nginx

# Cài PM2 (giữ app chạy liên tục, tự restart khi crash)
npm install -g pm2

# Tạo thư mục log cho PM2
mkdir -p /var/log/pm2
```

---

### Bước 4: Upload Code Lên Server

**Cách 1: SCP (Đơn giản, từ Windows)**

Mở **PowerShell mới** (KHÔNG đóng SSH), chạy trên máy Windows:

```powershell
# Upload toàn bộ project (bỏ node_modules và data)
scp -r d:\claude-agent\it-helpdesk root@178.62.123.45:/opt/
```

Quay lại cửa sổ SSH:

```bash
cd /opt/it-helpdesk
npm install --production
```

**Cách 2: Git Clone (Nếu đã có GitHub repo)**

```bash
cd /opt
git clone https://github.com/TEN_BAN/it-helpdesk.git
cd it-helpdesk
npm install --production
```

---

### Bước 5: Tạo File .env

```bash
cd /opt/it-helpdesk
nano .env
```

Dán vào nội dung sau, **đổi mật khẩu**:

```
NODE_ENV=production
PORT=3000
```

Lưu: `Ctrl+X` → `Y` → `Enter`

---

### Bước 6: Test Chạy App

```bash
cd /opt/it-helpdesk
node src/app.js
```

Nếu thấy:
```
✅ Server running at http://localhost:3000
```
→ Bấm `Ctrl+C` để dừng, sang bước tiếp.

Nếu có lỗi → xem phần [Troubleshoot](#-troubleshoot).

---

### Bước 7: Khởi Động App Với PM2

```bash
cd /opt/it-helpdesk

# Start app với PM2
pm2 start ecosystem.config.js

# Xem trạng thái
pm2 status
```

Kết quả mong muốn:
```
┌─────────────────┬────┬──────┬───────┬────────┐
│ name            │ id │ mode │ pid   │ status │
├─────────────────┼────┼──────┼───────┼────────┤
│ duy-helpdesk    │ 0  │ fork │ 12345 │ online │
└─────────────────┴────┴──────┴───────┴────────┘
```

```bash
# Cài đặt PM2 tự start khi VPS reboot
pm2 startup
# Chạy lệnh mà PM2 in ra (bắt đầu bằng "sudo env...")
pm2 save
```

---

### Bước 8: Cấu Hình Nginx

```bash
# Copy config đã chuẩn bị sẵn
cp /opt/it-helpdesk/nginx/dunetwork.conf /etc/nginx/sites-available/dunetwork

# Sửa tên domain trong file config
nano /etc/nginx/sites-available/dunetwork
```

Thay `yourdomain.com` bằng domain thực của bạn (vd: `helpdesk.dunetwork.vn`):
- Tìm dòng `server_name yourdomain.com www.yourdomain.com;`
- Sửa thành `server_name helpdesk.dunetwork.vn;`

Lưu: `Ctrl+X` → `Y` → `Enter`

```bash
# Kích hoạt site
ln -s /etc/nginx/sites-available/dunetwork /etc/nginx/sites-enabled/

# Xóa config mặc định (nếu có)
rm -f /etc/nginx/sites-enabled/default

# Kiểm tra cú pháp Nginx
nginx -t
```

Kết quả phải là:
```
nginx: configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

```bash
# Khởi động lại Nginx
systemctl restart nginx
systemctl enable nginx
```

---

### Bước 9: Trỏ Domain Về VPS

Vào trang quản lý DNS của nhà cung cấp domain (Inet, NameCheap, GoDaddy...):

Thêm record mới:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | helpdesk | 178.62.123.45 | 3600 |

*(Thay `helpdesk` bằng subdomain bạn muốn, thay IP bằng IP VPS)*

Nếu dùng domain gốc (vd: `dunetwork.vn` không có subdomain):

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | 178.62.123.45 | 3600 |
| A | www | 178.62.123.45 | 3600 |

Chờ **5-30 phút** DNS propagate. Kiểm tra tại [dnschecker.org](https://dnschecker.org).

---

### Bước 10: Cài SSL (HTTPS Miễn Phí)

Sau khi DNS đã trỏ về IP VPS:

```bash
# Lấy SSL certificate (thay bằng domain thực của bạn)
certbot --nginx -d helpdesk.dunetwork.vn

# Làm theo hướng dẫn:
# - Nhập email
# - Đồng ý Terms of Service: Y
# - Chọn có redirect HTTP → HTTPS: 2
```

Chờ ~30 giây. Sau đó thử truy cập `https://helpdesk.dunetwork.vn`.

Certificate tự động renew mỗi 90 ngày:

```bash
# Kiểm tra tự động renew
systemctl status certbot.timer
```

---

### Bước 11: Mở Firewall (UFW)

```bash
# Cho phép SSH, HTTP, HTTPS
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
ufw status
```

---

### Bước 12: Kiểm Tra Toàn Bộ

```bash
# App đang chạy?
pm2 status

# Nginx đang chạy?
systemctl status nginx

# SSL hợp lệ?
curl -I https://helpdesk.dunetwork.vn

# Xem log app
pm2 logs duy-helpdesk --lines 20
```

Mở browser: `https://helpdesk.dunetwork.vn` → Website phải hiện lên.

---

## 🔐 Đổi Mật Khẩu Admin

Sau khi deploy, mật khẩu mặc định là `admin123`. Cần đổi ngay!

SSH vào server, chạy:

```bash
cd /opt/it-helpdesk
node -e "
const db = require('./src/db/database');
db.run(\"UPDATE admin_users SET password = ? WHERE username = 'admin'\", ['MAT_KHAU_MOI_CUA_BAN'], () => {
  console.log('Đã đổi mật khẩu thành công!');
  process.exit(0);
});
"
```

*(Thay `MAT_KHAU_MOI_CUA_BAN` bằng mật khẩu mạnh của bạn)*

---

## 🔧 Quản Lý Server Hằng Ngày

```bash
# Xem app đang chạy
pm2 status

# Xem log realtime
pm2 logs duy-helpdesk

# Restart app (sau khi update code)
pm2 restart duy-helpdesk

# Stop app
pm2 stop duy-helpdesk

# Cập nhật code mới lên server
cd /opt/it-helpdesk
git pull            # nếu dùng git
pm2 restart duy-helpdesk

# Xem dung lượng disk
df -h

# Xem RAM
free -h

# Xem CPU
top

# Xem log Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## ❓ Troubleshoot

### App không start (PM2 error)

```bash
pm2 logs duy-helpdesk --err
# Xem lỗi cụ thể, thường do:
# - Thiếu npm install: cd /opt/it-helpdesk && npm install
# - Port đã bị dùng: lsof -i :3000 → kill -9 PID
```

### Website hiện 502 Bad Gateway

```bash
# App có đang chạy không?
pm2 status
# Không online → pm2 restart duy-helpdesk

# Nginx có đúng config không?
nginx -t
systemctl status nginx
```

### Domain không vào được

```bash
# DNS đã trỏ về IP chưa?
nslookup helpdesk.dunetwork.vn
# Phải trả về IP VPS của bạn

# Firewall có block không?
ufw status
# Phải có: Nginx Full ALLOW
```

### SSL lỗi

```bash
# Renew manual
certbot renew --dry-run    # test trước
certbot renew              # renew thật

# Certbot logs
journalctl -u certbot
```

### Mất data sau Railway redeploy

→ Thêm Railway Volume mount vào `/app/data` như Bước 3 ở Option A.

---

## 💡 Tips Nâng Cao

- **Backup database:** `scp root@IP:/opt/it-helpdesk/data/helpdesk.db ./backup_$(date +%Y%m%d).db`
- **Monitoring miễn phí:** [UptimeRobot.com](https://uptimerobot.com) - ping site mỗi 5 phút, báo email khi down
- **Security:** Sau khi deploy, đổi mật khẩu admin, xem xét thêm rate limiting
