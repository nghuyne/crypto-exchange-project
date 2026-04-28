# Project Context: NexChain AI-Driven Crypto Exchange

## 1. Giới thiệu tổng quan
Hệ thống là một sàn giao dịch tiền điện tử (Crypto Exchange) tích hợp các công nghệ tiên tiến: **Blockchain** để kiểm toán giao dịch và **AI** để quản trị rủi ro. Mục tiêu là tạo ra một môi trường giao dịch minh bạch, an toàn và chống lại các cuộc tấn công spam/gian lận.

---

## 2. Các thành phần hệ thống (Tech Stack)
- **Frontend:** React (TypeScript), CSS Vanila, React Router DOM v7, ApexCharts.
- **Backend API:** Go (Gin Framework), GORM, JWT Auth, WebSockets (Cổng 8081).
- **Matching Engine:** Hệ thống khớp lệnh FIFO (First-In, First-Out) - Đã fix lỗi logic Double-Counting.
- **Blockchain Audit:** Chuỗi khối Proof-of-Work (PoW) tùy chỉnh lưu vào file `blockchain_audit.db`.
- **AI Risk Engine:** Module phân tích rủi ro đa tầng (Rule-based: Amount, Frequency, Repetitive).

---

## 3. Tính năng nổi bật: Blockchain Audit Explorer (Status: COMPLETED)
Trang Explorer này là bằng chứng cho tính minh bạch của sàn giao dịch:
- **Immutable Evidence:** Mỗi giao dịch đặt lệnh đều được AI chấm điểm và ghi vĩnh viễn vào Block.
- **AI Breakdown Panel:** Click vào từng dòng giao dịch để xem chi tiết AI Judgment. Hiển thị thanh tiến trình ASCII (`████░░░░`) cho từng tiêu chí rủi ro.
- **Visual Analytics:** 
  - Biểu đồ Line theo dõi "Mức độ rủi ro trung bình" theo thời gian thực.
  - Biểu đồ Bar phân tích tỷ trọng rủi ro (Low/Medium/High) của toàn sàn.
- **Financial Details:** Hiển thị chính xác dòng tiền với dấu (+) cho Mua và (-) cho Bán, cùng mã màu trực quan.

---

## 4. Những gì ĐÃ LÀM ĐƯỢC (Milestones)
- [x] **[FIXED]** Matching Engine: Khớp lệnh Mua/Bán chuẩn xác, cập nhật ví đối ứng theo giá khớp.
- [x] **[ENHANCED]** Hệ thống Ví & Faucet: Mọi tài khoản mới nhận ngay **10,000 USDT + 10 BTC + 100 ETH**.
- [x] **[FIXED]** Profile & Auth: Hiển thị đúng Tên/Email thật của người dùng trên toàn hệ thống (Dynamic Header).
- [x] **[COMPLETED]** Blockchain Explorer: Tích hợp ApexCharts và chi tiết AI Judgment.
- [x] **[OPTIMIZED]** Backend CORS & Proxy: Hệ thống chạy ổn định trên cổng 8081.

---

## 5. CÁC LỖI & TỒN ĐỌNG (Current Focus)

### A. Lỗi Sổ lệnh (OrderBook)
- **Real-time Orderbook:** Hiện tại Widget Bids/Asks bên trang Market cần được kết nối chính xác với dữ liệu thực từ API `/api/v1/market/orderbook`.

### B. Đồng bộ hóa (Synchronization)
- **WebSocket Triggers:** Cần đảm bảo khi lệnh khớp, số dư trên Header và biểu đồ Blockchain Explorer phải được "đẩy" (push) cập nhật ngay lập tức mà không cần F5.

---

## 6. Ưu tiên tiếp theo (Roadmap)
1. **Kết nối Orderbook:** Đồng bộ bảng lệnh Mua/Bán trên trang Market.
2. **Nâng cấp AI Rules:** Chuyển từ mô phỏng (40/35/25) sang lấy dữ liệu thật từ Backend (đang cấu hình).
3. **Trade History:** Hiển thị lịch sử khớp lệnh thực tế (Market Trades).
