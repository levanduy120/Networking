# Hướng Dẫn Vận Hành — Duy Network Academy Portal

> Tài liệu này mô tả toàn bộ quy trình: tạo project → chạy local → kiểm tra → git → container → deploy Railway.
> Cập nhật: 2026-05-06

---

## MỤC LỤC

1. [Cấu trúc project](#1-cấu-trúc-project)
2. [Cài đặt lần đầu (One-time setup)](#2-cài-đặt-lần-đầu)
3. [Chạy server local](#3-chạy-server-local)
4. [Quy trình thay đổi code và kiểm tra local](#4-quy-trình-thay-đổi-code-và-kiểm-tra-local)
5. [Git — commit và push lên GitHub](#5-git--commit-và-push-lên-github)
6. [Container Docker — dùng để làm gì và khi nào](#6-container-docker)
7. [Deploy lên Railway từ GitHub](#7-deploy-lên-railway)
8. [Biến môi trường (.env)](#8-biến-môi-trường-env)
9. [Xử lý sự cố thường gặp](#9-xử-lý-sự-cố-thường-gặp)
10. [Checklist vận hành hàng ngày](#10-checklist-vận-hành-hàng-ngày)

---

## 1. Cấu Trúc Project

```
network-engineer-portal/
│
├── src/                        ← BACKEND (Node.js)
│   ├── app.js                  ← File chính — khởi động server, định nghĩa API routes
│   ├── db/
│   │   └── database.js         ← Khởi tạo SQLite, tạo bảng, seed dữ liệu mặc định
│   └── services/
│       └── email.js            ← Gửi email qua SMTP (Nodemailer)
│
├── public/                     ← FRONTEND (HTML/CSS/JS tĩnh)
│   ├── index.html              ← Trang chủ
│   ├── admin.html              ← Admin console
│   ├── register.html           ← Form đăng ký học viên
│   ├── support-task.html       ← Form gửi support task doanh nghiệp
│   ├── css/
│   │   ├── style.css           ← CSS trang chủ
│   │   └── admin.css           ← CSS admin panel
│   ├── js/
│   │   ├── main.js             ← Logic trang chủ (render card, form, ticket)
│   │   └── admin.js            ← Logic admin panel (login, quản lý ticket)
│   ├── network/                ← Các trang lộ trình học (6 trang)
│   ├── courses/                ← Các trang khóa học (4 trang)
│   ├── labs/                   ← Các trang EVE-NG lab (5 trang)
│   └── resources/              ← Các trang checklist/tài liệu (5 trang)
│
├── data/                       ← DATABASE (không commit lên git)
│   └── helpdesk.db             ← SQLite database (tự tạo khi chạy lần đầu)
│
├── .env                        ← Biến môi trường (không commit lên git — bí mật)
├── .env.example                ← Mẫu .env (commit lên git — để tham khảo)
├── .gitignore                  ← Danh sách file không đưa lên git
├── package.json                ← Dependencies và scripts npm
├── railway.json                ← Cấu hình Railway deployment
├── Dockerfile                  ← Cấu hình Docker container
├── setup-admins.js             ← Script tạo tài khoản admin lần đầu
└── ecosystem.config.js         ← Cấu hình PM2 (nếu dùng VPS)
```

### Luồng dữ liệu khi user truy cập web:
```
Browser → nginx (nếu dùng VPS) → Node.js Express (port 3000)
                                      ↓
                               public/ (HTML/CSS/JS)
                               SQLite (tickets, services, admin)
                               Nodemailer (email thông báo)
```

---

## 2. Cài Đặt Lần Đầu

### Yêu cầu máy tính:
- **Node.js** v18 trở lên → https://nodejs.org
- **Git** hoặc **GitHub Desktop**
- **VS Code** (khuyến nghị)

### Bước 1: Clone project về máy
```bash
# Nếu dùng terminal
git clone https://github.com/levanduy120/Networking.git
cd Networking/network-engineer-portal

# Nếu dùng GitHub Desktop:
# File → Clone Repository → nhập URL → chọn thư mục
```

### Bước 2: Cài dependencies
```bash
cd network-engineer-portal
npm install
```
> Lệnh này đọc `package.json` và tải tất cả thư viện vào thư mục `node_modules/`

### Bước 3: Tạo file .env
```bash
# Copy từ file mẫu
copy .env.example .env
```

Mở file `.env` và điền thông tin thật:
```env
NODE_ENV=development
PORT=3000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=MatKhauManhCuaBan123
ADMIN_SESSION_TTL_MINUTES=120
```

### Bước 4: Tạo tài khoản admin lần đầu
```bash
node setup-admins.js
```
Output mong đợi:
```
Setting up admin user...
Admin user is ready: admin
Password was stored as a bcrypt hash.
```
> ⚠️ Phải làm bước này TRƯỚC khi chạy server lần đầu. Nếu bỏ qua, không đăng nhập admin được.

---

## 3. Chạy Server Local

### Cách 1: Chạy thường (production-like)
```bash
npm start
# hoặc
node src/app.js
```

### Cách 2: Chạy với auto-reload khi sửa code (khuyến nghị khi dev)
```bash
npm run dev
# hoặc
npx nodemon src/app.js
```
> `nodemon` tự restart server mỗi khi bạn lưu file `.js`

### Kiểm tra server đang chạy:
Mở browser vào:
| URL | Nội dung |
|-----|----------|
| http://localhost:3000 | Trang chủ public |
| http://localhost:3000/admin | Admin console |
| http://localhost:3000/register.html | Form đăng ký |
| http://localhost:3000/support-task.html | Form support |

### Dừng server:
```bash
# Trong terminal đang chạy server
Ctrl + C
```

---

## 4. Quy Trình Thay Đổi Code và Kiểm Tra Local

### Quy trình chuẩn mỗi lần sửa:

```
Mở VS Code
    ↓
Sửa file (HTML/CSS/JS/src)
    ↓
Lưu file (Ctrl+S)
    ↓
[Nếu sửa frontend] → Refresh browser (F5) → Kiểm tra
[Nếu sửa backend]  → nodemon tự restart → Refresh browser → Kiểm tra
    ↓
Kiểm tra console browser (F12 → Console) xem có lỗi không
    ↓
Kiểm tra terminal server xem có lỗi không
    ↓
OK → Commit lên Git
```

### Sửa frontend (HTML/CSS/JS trong public/):
- Lưu file → **F5** trong browser là thấy ngay
- Không cần restart server

### Sửa backend (src/app.js, src/db/, src/services/):
- Nếu dùng `nodemon` → tự restart
- Nếu dùng `node src/app.js` thường → phải `Ctrl+C` rồi chạy lại

### Test nhanh API với PowerShell:
```powershell
# Test API services
Invoke-RestMethod http://localhost:3000/api/services

# Test tạo ticket
Invoke-RestMethod -Uri http://localhost:3000/api/tickets -Method POST `
  -ContentType "application/json" `
  -Body '{"customer_name":"Test","customer_email":"test@test.com","service_id":1,"title":"Test","description":"Test ticket","priority":"medium"}'

# Test 404
Invoke-RestMethod http://localhost:3000/khong-ton-tai
```

### Xem log lỗi:
- **Terminal server**: hiện lỗi backend (database, email, crash)
- **Browser F12 → Console**: hiện lỗi frontend (JS, API call fail)
- **Browser F12 → Network**: xem API request/response chi tiết

---

## 5. Git — Commit và Push Lên GitHub

### Khái niệm cơ bản:
```
Working Directory (file trên máy bạn)
    ↓  git add .
Staging Area (file đã chọn để commit)
    ↓  git commit -m "message"
Local Repository (lịch sử trên máy bạn)
    ↓  git push
Remote Repository (GitHub)
```

### Quy trình push code chuẩn:

```powershell
# 1. Xem file nào đã thay đổi
git status

# 2. Thêm tất cả file thay đổi vào staging
git add .

# 3. Hoặc thêm từng file cụ thể
git add public/index.html
git add src/app.js

# 4. Commit với message rõ ràng
git commit -m "feat: thêm testimonials section"

# 5. Push lên GitHub
git push origin main
```

### Quy tắc viết commit message:
```
feat: thêm tính năng mới
fix: sửa lỗi
style: thay đổi CSS/UI
refactor: tái cấu trúc code
chore: cập nhật config/dependencies
docs: cập nhật tài liệu
```

### Ví dụ thực tế:
```bash
git commit -m "feat: thêm section testimonials học viên"
git commit -m "fix: sửa lỗi session timeout admin panel"
git commit -m "style: cập nhật màu hero section và font size"
git commit -m "chore: update railway.json start command"
```

### Kiểm tra lịch sử commit:
```bash
git log --oneline -10
```

### Xem thay đổi trước khi commit:
```bash
git diff
```

### Lấy code mới từ GitHub về máy (khi cộng tác):
```bash
git pull origin main
```

### Nếu dùng GitHub Desktop (thay thế terminal):
1. Mở GitHub Desktop
2. Thấy file thay đổi ở cột trái
3. Điền **Summary** (commit message)
4. Click **Commit to main**
5. Click **Push origin**

---

## 6. Container Docker

### Docker dùng để làm gì?

Docker đóng gói toàn bộ app + môi trường (Node.js, dependencies) vào một **container** — chạy giống nhau ở mọi nơi: máy bạn, server, Railway, AWS.

```
Không có Docker:
  Máy A: Node 18 → Chạy OK
  Máy B: Node 16 → Lỗi version
  Server: Node 20 → Hành vi khác

Có Docker:
  Mọi nơi đều dùng cùng 1 image (Node 20-alpine) → Luôn giống nhau
```

### Khi nào cần Docker?
| Tình huống | Dùng Docker? |
|-----------|-------------|
| Dev local trên máy mình | Không cần |
| Railway (tự build) | Railway tự dùng Dockerfile |
| VPS/server riêng | Có — rất khuyến nghị |
| Cộng tác nhiều người | Có — đảm bảo môi trường đồng nhất |

### Dockerfile hiện tại giải thích:
```dockerfile
FROM node:20-alpine        # Dùng Node 20 trên Linux Alpine (nhẹ ~50MB)
WORKDIR /app               # Thư mục làm việc trong container
COPY package*.json ./      # Copy package.json trước
RUN npm ci --only=production  # Cài dependencies (không cài devDependencies)
COPY . .                   # Copy toàn bộ code
RUN mkdir -p data          # Tạo thư mục chứa SQLite
EXPOSE 3000                # Khai báo port
ENV NODE_ENV=production    # Set biến môi trường
CMD ["node", "src/app.js"] # Lệnh chạy khi container khởi động
```

### Build và chạy Docker local (nếu cần test):
```bash
# Build image
docker build -t duy-network-portal .

# Chạy container
docker run -p 3000:3000 \
  -e ADMIN_USERNAME=admin \
  -e ADMIN_PASSWORD=MatKhau123 \
  -v $(pwd)/data:/app/data \
  duy-network-portal

# Truy cập: http://localhost:3000
```

> 💡 Railway tự đọc `Dockerfile` hoặc tự build qua Nixpacks — bạn không cần chạy Docker thủ công khi dùng Railway.

---

## 7. Deploy Lên Railway

### Luồng deploy tự động:
```
Bạn push code lên GitHub (git push)
    ↓
Railway phát hiện có commit mới (webhook)
    ↓
Railway build: npm ci --only=production
    ↓
Railway chạy: node setup-admins.js && node src/app.js
    ↓
Web live trên URL Railway
```

### Setup lần đầu trên Railway:

**Bước 1: Kết nối GitHub**
- Vào Railway project → tab **Settings**
- Mục **Source** → chọn **GitHub repo**: `levanduy120/Networking`
- **Branch**: `main`
- **Root Directory**: `network-engineer-portal`

**Bước 2: Thêm Volume (giữ database)**
- Tab **Volumes** → **Add Volume**
- **Mount Path**: `/app/data`
- Không có Volume → database mất khi restart

**Bước 3: Set Environment Variables**

Vào tab **Variables**, thêm từng dòng:

```
NODE_ENV          = production
ADMIN_USERNAME    = admin
ADMIN_PASSWORD    = (mật khẩu mạnh của bạn)
ADMIN_SESSION_TTL_MINUTES = 120
ALLOWED_ORIGIN    = https://xxx.railway.app  ← URL Railway sau khi deploy
SMTP_USER         = levanduy120@gmail.com
SMTP_PASS         = (app password Gmail)
OWNER_EMAIL       = levanduy120@gmail.com
MAIL_FROM         = Duy Network Engineer <levanduy120@gmail.com>
```

**Bước 4: Deploy**
- Railway tự deploy sau khi set Variables
- Hoặc click **Deploy** thủ công

**Bước 5: Kiểm tra sau deploy**
- Click vào URL Railway (dạng `xxx.up.railway.app`)
- Vào `/admin` → đăng nhập bằng ADMIN_USERNAME/ADMIN_PASSWORD đã set
- Tạo thử 1 ticket để test email

### Mỗi lần update sau này:
```bash
# Chỉ cần push lên GitHub là Railway tự deploy
git add .
git commit -m "fix: sửa lỗi XYZ"
git push origin main
# → Railway tự build và deploy trong ~2-3 phút
```

### Xem log Railway:
- Vào Railway project → tab **Deployments** → click deployment đang chạy → xem **Build Logs** và **Deploy Logs**

---

## 8. Biến Môi Trường (.env)

### File .env — dùng khi nào?
- **Local**: tạo file `.env` trong thư mục project
- **Railway**: nhập vào tab Variables (không dùng file .env)
- **KHÔNG commit file `.env` lên GitHub** — chứa mật khẩu bí mật

### Toàn bộ biến hỗ trợ:

| Biến | Bắt buộc | Mô tả | Ví dụ |
|------|---------|-------|-------|
| `NODE_ENV` | ✅ | Môi trường chạy | `production` hoặc `development` |
| `PORT` | ✅ | Port server | `3000` |
| `ADMIN_USERNAME` | ✅ | Tên đăng nhập admin | `admin` |
| `ADMIN_PASSWORD` | ✅ | Mật khẩu admin (≥8 ký tự) | `MatKhau@2026` |
| `ADMIN_SESSION_TTL_MINUTES` | ❌ | Thời gian session hết hạn | `120` |
| `ALLOWED_ORIGIN` | ❌ | Domain được phép CORS | `https://network.ai.vn` |
| `SMTP_HOST` | ❌ | SMTP server | `smtp.gmail.com` |
| `SMTP_PORT` | ❌ | SMTP port | `587` |
| `SMTP_SECURE` | ❌ | Dùng SSL? | `false` |
| `SMTP_USER` | ❌ | Email gửi | `levanduy120@gmail.com` |
| `SMTP_PASS` | ❌ | App password Gmail | `xxxx xxxx xxxx xxxx` |
| `MAIL_FROM` | ❌ | Tên hiển thị email | `Duy Network <email@gmail.com>` |
| `OWNER_EMAIL` | ❌ | Email nhận thông báo ticket | `levanduy120@gmail.com` |

### Tạo App Password Gmail (cho email):
1. Vào myaccount.google.com → Security
2. Bật **2-Step Verification**
3. Tìm **App passwords** → tạo mới
4. Copy 16 ký tự → dán vào `SMTP_PASS`

---

## 9. Xử Lý Sự Cố Thường Gặp

### ❌ Lỗi: `Error: listen EADDRINUSE :::3000`
**Nguyên nhân**: Port 3000 đang bị process khác chiếm  
**Fix**:
```powershell
# Tìm process đang dùng port 3000
Get-NetTCPConnection -LocalPort 3000 | Select-Object OwningProcess

# Kill process đó (thay 12345 bằng PID thực tế)
Stop-Process -Id 12345 -Force

# Chạy lại server
npm start
```

---

### ❌ Lỗi: `Cannot find module 'express'` hoặc `MODULE_NOT_FOUND`
**Nguyên nhân**: Chưa cài dependencies  
**Fix**:
```bash
npm install
```

---

### ❌ Lỗi: `No admin users found` khi vào /admin
**Nguyên nhân**: Chưa chạy `setup-admins.js`  
**Fix**:
```bash
# Đảm bảo ADMIN_PASSWORD đã có trong .env
node setup-admins.js
```

---

### ❌ Lỗi: `ADMIN_PASSWORD is required`
**Nguyên nhân**: File `.env` chưa có hoặc thiếu `ADMIN_PASSWORD`  
**Fix**:
```bash
# Kiểm tra file .env
cat .env

# Đảm bảo có dòng:
# ADMIN_PASSWORD=MatKhauCuaBan123
```

---

### ❌ Lỗi: Đăng nhập admin báo "Sai mật khẩu" dù nhập đúng
**Nguyên nhân**: Database cũ chứa hash cũ, hoặc chưa run setup lại sau khi đổi password  
**Fix**:
```bash
# Chạy lại setup — sẽ UPDATE password mới vào DB
node setup-admins.js
```

---

### ❌ Lỗi: Railway deploy fail — `ADMIN_PASSWORD is required`
**Nguyên nhân**: Chưa set biến môi trường `ADMIN_PASSWORD` trong Railway  
**Fix**: Vào Railway → tab **Variables** → thêm `ADMIN_PASSWORD`

---

### ❌ Lỗi: Railway deploy thành công nhưng database trống sau restart
**Nguyên nhân**: Chưa gắn Volume — Railway dùng ephemeral storage  
**Fix**: Vào Railway → tab **Volumes** → **Add Volume** → Mount Path: `/app/data`

---

### ❌ Lỗi: Git push bị "rejected" hoặc "non-fast-forward"
**Nguyên nhân**: GitHub có commit mới mà máy bạn chưa pull về  
**Fix**:
```bash
git pull origin main --rebase
git push origin main
```

---

### ❌ Lỗi: `fatal: detected dubious ownership`
**Nguyên nhân**: Thư mục project được tạo bởi user Windows khác  
**Fix**:
```bash
git config --global --add safe.directory D:/claude-agent/network-engineer-portal
```

---

### ❌ Email không gửi được
**Nguyên nhân**: SMTP chưa cấu hình hoặc App Password sai  
**Fix**:
1. Kiểm tra `SMTP_PASS` trong `.env` — phải là App Password (16 ký tự), không phải mật khẩu Gmail thường
2. Kiểm tra Gmail đã bật 2-Step Verification chưa
3. Server vẫn hoạt động bình thường kể cả khi email lỗi — ticket vẫn được tạo

---

### ❌ Web chạy nhưng hiện lỗi JS ở Console browser
**Cách debug**:
1. Mở browser → `F12` → tab **Console**
2. Đọc lỗi, tìm dòng file:line
3. Tab **Network** → xem API call nào fail (màu đỏ)
4. Click vào request đỏ → xem **Response** để biết lỗi từ server

---

## 10. Checklist Vận Hành Hàng Ngày

### Khi mở máy vào làm:
```
□ cd network-engineer-portal
□ npm run dev          ← chạy server với auto-reload
□ Mở http://localhost:3000 kiểm tra
□ Mở http://localhost:3000/admin kiểm tra
```

### Sau khi sửa code:
```
□ Lưu file (Ctrl+S)
□ Refresh browser (F5)
□ Kiểm tra Console (F12) không có lỗi đỏ
□ Test tính năng vừa sửa
□ git add . && git commit -m "mô tả thay đổi"
□ git push origin main
□ Chờ Railway deploy (~2-3 phút)
□ Kiểm tra URL Railway xem có OK không
```

### Kiểm tra Railway sau deploy:
```
□ Vào Railway → Deployments → xem Build Logs không có lỗi
□ Vào URL Railway → trang chủ load OK
□ Vào /admin → đăng nhập OK
□ Tạo thử 1 ticket test
□ Kiểm tra email nhận được không (nếu dùng SMTP)
```

---

## Tóm Tắt Lệnh Hay Dùng

```bash
# === CÀI ĐẶT ===
npm install                    # Cài dependencies lần đầu
node setup-admins.js           # Tạo/cập nhật tài khoản admin

# === CHẠY SERVER ===
npm start                      # Chạy production
npm run dev                    # Chạy dev với auto-reload

# === GIT ===
git status                     # Xem file thay đổi
git add .                      # Stage tất cả thay đổi
git commit -m "message"        # Commit
git push origin main           # Push lên GitHub
git pull origin main           # Lấy code mới từ GitHub
git log --oneline -10          # Xem 10 commit gần nhất

# === KILL PORT ===
# PowerShell:
$p = (Get-NetTCPConnection -LocalPort 3000).OwningProcess
Stop-Process -Id $p -Force

# === DOCKER (nếu cần) ===
docker build -t portal .
docker run -p 3000:3000 --env-file .env portal
```

---

*Tài liệu được tạo tự động. Cập nhật khi có thay đổi quy trình.*
