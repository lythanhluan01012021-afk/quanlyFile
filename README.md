# NexusAuth - Hệ Thống Đăng Nhập & Đăng Ký Người Dùng Với Đăng Nhập Nhanh Google

Dự án cung cấp giao diện xác thực người dùng (Authentication) hoàn chỉnh, đẹp mắt theo xu hướng Glassmorphism hiện đại, hỗ trợ **Đăng nhập**, **Đăng ký**, **Khôi phục mật khẩu** và đặc biệt là **Đăng nhập nhanh bằng tài khoản Google (Google Sign-In)**.

---

## 🌟 Tính Năng Nổi Bật

1. **Đăng nhập nhanh bằng Google (Google Sign-In)**:
   - Tích hợp chuẩn thư viện **Google Identity Services (GIS)** (`https://accounts.google.com/gsi/client`).
   - Cung cấp **Chế độ mô phỏng tương tác thông minh (Simulator)**: Bạn có thể trải nghiệm luồng đăng nhập tài khoản Google ngay lập tức mà không cần cấu hình GCP Client ID trước.
   - Hộp thoại cấu hình trực tiếp: Cho phép bạn nhập `Google Client ID` từ Google Cloud Console để chạy luồng thực tế bất cứ lúc nào.
2. **Chuyển đổi Tab mượt mà (Dual Tabs)**:
   - Hiệu ứng thanh trượt viên thuốc (Sliding pill) chuyển động linh hoạt giữa **Đăng nhập** và **Đăng ký**.
3. **Thanh đo độ mạnh mật khẩu (Live Password Strength Meter)**:
   - Tự động phân tích mật khẩu theo 4 cấp độ: *Rất yếu, Yếu, Trung bình, Khá, Rất mạnh/An toàn*.
   - Danh sách kiểm tra điều kiện trực quan với dấu tích xanh theo thời gian thực (Độ dài, chữ hoa/thường, số, ký tự đặc biệt).
4. **Kiểm tra mật khẩu xác nhận**:
   - Tự động hiển thị huy hiệu `✓ Khớp` khi mật khẩu xác nhận trùng khớp hoàn toàn.
5. **Hiện / Ẩn mật khẩu (Show/Hide Password)**:
   - Nút bật/tắt hiển thị mật khẩu bằng icon mắt SVG trực quan.
6. **Lưu trữ dữ liệu giả lập (Mock Database & LocalStorage)**:
   - Lưu tài khoản đăng ký vào `localStorage`, bạn có thể đăng ký tài khoản mới và đăng nhập lại ngay lập tức.
   - Có sẵn tài khoản mẫu để đăng nhập thử nghiệm:
     - **Email**: `demo@nexus.com`
     - **Mật khẩu**: `Password@123`
7. **Giao diện Dashboard / Thông tin người dùng sau khi đăng nhập**:
   - Hiển thị avatar, tên, email, phương thức xác thực (Google / Email), huy hiệu bảo mật OAuth 2.0, thời gian đăng nhập và mã phiên (Session ID).
   - Nút **Đăng xuất (Sign out)** an toàn.
8. **Chế độ Sáng / Tối (Dark / Light Mode)**:
   - Chuyển đổi giao diện sáng tối chỉ với 1 click, lưu trạng thái tự động.
9. **Hệ thống thông báo Toast (Toast Notifications)**:
   - Thông báo trạng thái (Thành công, Thất bại, Thông tin) góc trên mượt mà và tự biến mất sau 4 giây.

---

## 🚀 Hướng Dẫn Khởi Chạy

Dự án không phụ thuộc vào thư viện ngoài (Zero external dependencies). Chỉ cần có Node.js:

### Bước 1: Khởi động máy chủ
Mở terminal trong thư mục dự án và chạy:
```bash
npm start
```
*Hoặc:*
```bash
node server.js
```

### Bước 2: Truy cập trình duyệt
Mở trình duyệt bất kỳ (Chrome, Edge, Firefox, Brave...) và truy cập:
```
http://localhost:3000
```

---

## ⚙️ Cấu Hình Google OAuth 2.0 Thật (Nếu Cần)

Nếu bạn muốn kết nối trực tiếp với tài khoản Google thật của dự án:
1. Truy cập [Google Cloud Console](https://console.cloud.google.com/).
2. Tạo dự án và tạo **OAuth 2.0 Client ID** (chọn loại Web Application).
3. Thêm `http://localhost:3000` vào **Authorized JavaScript origins**.
4. Trên giao diện web, nhấn vào **biểu tượng bánh răng cài đặt** ở góc trên bên phải thanh header.
5. Dán Client ID của bạn vào ô và bấm **Lưu cấu hình**.
