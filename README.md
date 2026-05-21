# NhàTrọ Pro – Frontend

Giao diện web cho ứng dụng quản lý nhà/phòng cho thuê. Xây dựng bằng Next.js + Tailwind CSS.

> Cần cài và chạy [Backend API](https://github.com/dathq11/nhatro-pro-api) trước.

## Yêu cầu

- Node.js >= 18
- Backend API đang chạy

## Cài đặt

### 1. Clone repo

```bash
git clone https://github.com/dathq11/nhatro-pro-web.git
cd nhatro-pro-web
```

### 2. Cài dependencies

```bash
npm install
```

### 3. Tạo file `.env.local`

```bash
cp .env.example .env.local
```

Mở file `.env.local` và điền URL backend:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

> Nếu backend chạy trên server khác, thay `localhost:3001` bằng địa chỉ tương ứng.

### 4. Chạy app

```bash
# Development
npm run dev

# Production
npm run build
npm run start
```

App mặc định chạy tại `http://localhost:3000`

## Đăng nhập

Dùng tài khoản đã cấu hình trong file `.env` của backend (`AUTH_USERNAME` / `AUTH_PASSWORD`).
