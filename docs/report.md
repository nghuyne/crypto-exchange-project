# Báo Cáo Kỹ Thuật Chi Tiết Backend (Giai đoạn 2) — Dự Án CryptoEX

**Người thực hiện:** Ngọc Huy  
**Vị trí:** Backend Lead & Matching Engine Architect  
**Ngày cập nhật:** 01/04/2026

---

## 1. Kiến trúc Hệ Thống tổng quát
Hệ thống được xây dựng theo mô hình **Centralized Exchange (CEX)** tương tự Binance nhưng có thêm lớp đồng bộ hóa dữ liệu ra Blockchain.
- **Backend Core:** Ngôn ngữ Go (Golang) hiệu năng cao, xử lý đồng thời (concurrency).
- **Matching Engine:** Xử lý khớp lệnh hoàn toàn dưới RAM/Database với độ trễ cực thấp.
- **Real-time Push:** Sử dụng WebSocket để đảm bảo trải nghiệm giao dịch không cần reload trang.

---

## 2. Chi tiết các Module Chức Năng

### 🔹 Module 1: Matching Engine (FIFO Algorithm)
Đây là phần quan trọng nhất của sàn giao dịch. Tôi đã triển khai thuật toán **FIFO (First-In, First-Out)** dựa trên ưu tiên Giá và Thời gian:
- **Ưu tiên 1 (Giá):** Lệnh mua giá cao nhất và lệnh bán giá thấp nhất sẽ được xếp lên đầu hàng đợi.
- **Ưu tiên 2 (Thời gian):** Nếu cùng mức giá, lệnh nào vào trước sẽ được khớp trước.
- **Tính năng Khớp từng phần (Partial Match):** Nếu User A mua 10 BTC nhưng User B chỉ bán 2 BTC, hệ thống sẽ khớp 2 BTC, phần còn lại (8 BTC) sẽ tiếp tục nằm trong Sổ lệnh chờ người bán tiếp theo.

### 🔹 Module 2: Cơ chế Bảo mật Tài chính (Fund Locking & Atomicity)
Để đảm bảo người dùng không thể "tiêu tiền 2 lần" (Double-spending) hoặc gian lận:
- **Locking:** Ngay khi một lệnh Mua/Bán được tạo ra, hệ thống tự động tính toán tổng số tiền (Price * Quantity) và khóa nó lại trong `LockedBalance`.
- **Database Transaction:** Toàn bộ quá trình KHỚP LỆNH -> TRỪ TIỀN A -> CỘNG TIỀN B -> LƯU LỊCH SỬ TRADE được thực hiện trong một **Transaction duy nhất**. Nếu có bất kỳ bước nào lỗi, toàn bộ dữ liệu sẽ được `Rollback` (hoàn tác) về trạng thái cũ, đảm bảo tuyệt đối không làm mất tiền của người dùng.

### 🔹 Module 3: WebSocket Real-time Broadcasting
Thay vì bắt Frontend phải gọi API liên tục (Polling), tôi đã xây dựng hệ thống WebSocket:
- **Package:** `ws` độc lập.
- **Protocol:** Khi một giao dịch khớp lệnh diễn ra thành công, Server tự động tạo một Event `TRADE_EXECUTED`.
- **Socket:** Dữ liệu về giá khớp, số lượng và thời gian sẽ được "bắn" ngay lập tức cho tất cả người dùng đang theo dõi sổ lệnh.

---

## 3. Hệ Thống Endpoint API (Đầy đủ nhất)

### 🔑 Nhóm Authentication (Bảo mật JWT)
- `POST /register`: Mã hóa mật khẩu bằng **Bcrypt**, tự động khởi tạo 3 ví tài sản (USDT, BTC, ETH) cho User mới.
- `POST /login`: Xác thực thông tin và cấp phát **JWT Token** có hiệu lực 24 giờ.

### 💰 Nhóm Quản lý Tài sản (Wallet)
- `GET /wallet`: Hiển thị số dư thực tế (`Balance`) và số dư đang bị khóa (`LockedBalance`).
- `POST /deposit`: Giả lập nạp tiền từ bên ngoài vào sàn (Hỗ trợ USDT, BTC, ETH).

### 📈 Nhóm Giao dịch (Orders)
- `POST /orders`: Đặt lệnh mua/bán. Tự động kiểm tra số dư và kích hoạt Matching Engine ngay lập tức.
- `GET /orders`: Lấy danh sách lệnh đang chờ và lịch sử lệnh cá nhân.
- `DELETE /orders/:id`: Hủy lệnh đang treo. Hệ thống tự động mở khóa (Unlock) số dư tài sản tương ứng.

### 📊 Nhóm Dữ liệu Thị trường (Market Data)
- `GET /market/orderbook`: Trả về dữ liệu **Market Depth** (Asks vs Bids) được sắp xếp theo đúng thứ tự ưu tiên giao dịch.
- `GET /market/trades`: Hiển thị danh sách các giao dịch khớp lệnh gần nhất trên toàn sàn.

---

## 4. Kết quả Kiểm thử & Độ tin cậy (Test Results)

Hệ thống đã trải qua các bài kiểm thử Unit Test và Integration Test quan trọng:
- [x] **Test Khớp lệnh xuyên suốt:** User A (Buyer) và User B (Seller) khớp lệnh thành công ở cùng mức giá.
- [x] **Test Hủy lệnh:** Số dư bị khóa được hoàn lại đúng 100% về ví ban đầu khi người dùng nhấn hủy.
- [x] **Test Parallel Execution:** Khi nhiều người đặt lệnh cùng lúc, `sync.Mutex` đảm bảo bộ máy khớp lệnh không bị ghi đè dữ liệu (Race condition).
- [x] **Test Database Integrity:** Giả lập lỗi giữa chừng khi đang khớp lệnh, hệ thống tự động hoàn tiền và không có bản ghi lỗi nào phát sinh.

---

## 5. Định hướng Phát triển Giai đoạn 3

1. **AI Integration:** Móc nối với module AI (Person 4) để thực hiện cảnh báo rủi ro (Risk Check) trước khi lệnh đi vào Matching Engine.
2. **Blockchain Sync:** Triển khai cơ chế lắng nghe Trade Event và gửi dữ liệu sang Blockchain node (Person 2) để minh bạch hóa toàn bộ lịch sử giao dịch.
3. **Advanced Order Types:** Hỗ trợ lệnh `Market Order` (Mua ngay giá tốt nhất) và `Stop-loss` (Dừng lỗ tự động).

---

**Xác nhận hoàn tất phần Core Backend**  
*Ngọc Huy*
