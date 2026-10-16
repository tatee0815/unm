# 💕 UNM - Góc Nhỏ Kỷ Niệm Của Hai Ta 🌸

> *Nơi lưu giữ từng khoảnh khắc dịu dàng, những câu chuyện nhỏ bé và hành trình ngọt ngào của hai đứa mình.*

---

## ✨ Giới thiệu

**UNM** là một trang web nhật ký và lưu giữ kỷ niệm tình yêu được thiết kế với giao diện lãng mạn, ấm áp và hiện đại. Ứng dụng giúp hai người cùng nhau ghi lại những cột mốc đáng nhớ, quản lý lịch trình hẹn hò, chia sẻ tâm tư và cùng mở khóa những điều bất ngờ thú vị.

---

## 🌟 Tính năng nổi bật

### 1. 🏡 Lời Chào (Welcome)
- Trang mở đầu dịu dàng, tạo cảm xúc ấm cúng với lời nhắn nhủ yêu thương.
- Nút dẫn lối nhanh đến các góc kỷ niệm.

### 2. 📅 Kỷ Niệm & Lịch Tương Tác (Memories Calendar)
- **Lịch theo tháng tương tác:** Dễ dàng tra cứu và xem lại các bài viết theo từng ngày cụ thể.
- **Tạo bài viết kỷ niệm:** 
  - Chọn ngày, gắn tiêu đề và viết nội dung chi tiết.
  - Đính kèm biểu tượng cảm xúc / sticker biểu cảm.
  - Tải lên nhiều ảnh kỷ niệm chất lượng cao (lưu trữ qua Cloudinary).
  - Phân loại người đăng: *Her*, *Him* hoặc *Cả 2 đứa*.

### 3. 🎀 Hồ Sơ Cá Nhân (Her & Him Tabs)
- Góc riêng dành cho từng người:
  - Tùy chỉnh ảnh đại diện (kèm công cụ căn chỉnh, phóng to/thu nhỏ avatar tiện lợi).
  - Biệt danh, dòng trạng thái (subtitle).
  - Danh sách những điều thích (Likes) và những điều không thích (Dislikes).
  - Ghi chú quan trọng cần nhớ về đối phương.
  - Dòng thời gian các cột mốc cá nhân đáng nhớ.

### 4. 📖 Chuyện Của Chúng Mình (Us Timeline)
- Dòng thời gian tổng hợp các kỷ niệm chung đặc biệt của cả hai người.
- Bộ lọc khoảnh khắc đặc biệt giúp dễ dàng ôn lại từng chặng đường đã đi qua.

### 5. 🎁 Tab Bí Mật ("???") - Mini Game Hành Trình
- Trò chơi trắc nghiệm mở khóa 4 mảnh ghép kỷ niệm:
  - *Cột mốc 1:* Chiếc quẹt match định mệnh trên FB Dating.
  - *Cột mốc 2:* Những đêm nhắn tin trò chuyện thấu sáng.
  - *Cột mốc 3:* Sự thấu hiểu và an tâm khi tìm thấy đúng người.
  - *Cột mốc 4:* Buổi hẹn hò đầu tiên bước ra đời thực.
- Sau khi hoàn thành bảng ghép: Mở khóa **Bức tâm thư chân thành** hé mở từng bước kèm **Phiếu bé ngoan độc quyền** dành tặng người thương.

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

- **Frontend:** [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Animation & Icons:** [Framer Motion](https://www.framer.com/motion/), [Lucide React](https://lucide.dev/), [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
- **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL & Realtime synchronization)
- **Image Storage:** [Cloudinary](https://cloudinary.com/) (Upload & Media Management)

---

## 🚀 Hướng dẫn cài đặt & Khởi chạy

### 1. Yêu cầu môi trường
- [Node.js](https://nodejs.org/) (phiên bản 18 trở lên khuyến nghị)
- Trình quản lý gói `npm` hoặc `yarn` / `pnpm`

### 2. Cài đặt các gói phụ thuộc
```bash
# Clone dự án về máy
git clone <URL_REPOSITORY_CỦA_BẠN>
cd unm

# Cài đặt dependencies
npm install
```

### 3. Cấu hình biến môi trường
Tạo file `.env` ở thư mục gốc (dựa trên mẫu `.env.example`):

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key

# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-cloudinary-upload-preset
```

### 4. Khởi chạy ứng dụng
```bash
# Chạy ở môi trường phát triển (Local dev)
npm run dev
```
Mở trình duyệt tại địa chỉ: `http://localhost:5173`

### 5. Build dự án cho Production
```bash
npm run build
```
Thư mục `dist/` được tạo ra sẵn sàng để deploy lên Vercel, Netlify hoặc bất kỳ nền tảng tĩnh nào.

---

## 📁 Cấu trúc thư mục dự án

```text
unm/
├── public/                 # Tài nguyên tĩnh (favicon, icons)
├── src/
│   ├── assets/             # Hình ảnh kỷ niệm & icons nội bộ
│   ├── components/
│   │   ├── modals/         # Các modal (chỉnh sửa avatar, xác nhận, thông báo)
│   │   ├── tabs/           # Các màn hình chính (Welcome, Memories, Profile, Us, SecretGame)
│   │   └── Navbar.tsx      # Thanh điều hướng các tab
│   ├── lib/
│   │   ├── cloudinary.ts   # Cấu hình tải ảnh lên Cloudinary
│   │   └── supabase.ts     # Khởi tạo kết nối Supabase client
│   ├── types/              # Khai báo kiểu TypeScript chung
│   ├── App.tsx             # Component gốc quản lý state & dữ liệu
│   ├── App.css             # Định kiểu tùy chỉnh bổ sung
│   └── main.tsx            # Điểm vào chính của ứng dụng
├── .env.example            # Mẫu cấu hình biến môi trường
├── .gitignore              # Danh sách file loại trừ khỏi git
├── package.json            # Thông tin dependencies & scripts
└── README.md               # Tài liệu dự án
```

---

## 💖 Lời nhắn
> *"Mỗi ngày bên nhau đều là một món quà đặc biệt. Chúc cho hành trình của hai đứa mình luôn tràn ngập tiếng cười, sự thấu hiểu và hạnh phúc!"*
