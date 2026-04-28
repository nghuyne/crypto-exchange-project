# 📋 Tài Liệu Nghiệp Vụ — CryptoEX
## Sàn Giao Dịch Tiền Mã Hoá Mô Phỏng

> **Phiên bản:** 1.0 | **Ngày:** 27/03/2026 | **Nhóm:** 4 thành viên  
> **Mục tiêu tài liệu:** Giúp toàn bộ nhóm — kể cả người không làm kỹ thuật — **hiểu rõ hệ thống đang xây dựng làm gì, cho ai, và hoạt động như thế nào.**

---

## 🎯 Hệ Thống Này Là Gì? (Mô Tả Đơn Giản)

Hãy tưởng tượng **CryptoEX** giống như một **sàn chứng khoán**, nhưng thay vì mua bán cổ phiếu, người dùng mua bán **tiền mã hoá** (Bitcoin, Ethereum...).

Bạn có thể:
- Nạp tiền thật (USD, VNĐ) vào tài khoản
- Dùng số tiền đó để **mua Bitcoin** khi giá thấp
- Sau đó **bán Bitcoin** khi giá lên để kiếm lời
- Rút tiền về tài khoản ngân hàng của mình
- Xem AI gợi ý nên mua hay bán tại thời điểm đó

**Điểm đặc biệt của đồ án:** Mọi giao dịch trên sàn đều được ghi vào một **Blockchain tự làm** — giống như một cuốn sổ kế toán điện tử, minh bạch và không thể sửa đổi.

---

## 👥 Ai Dùng Hệ Thống? (Các Vai Trò)

### 🟢 Người Dùng Thông Thường (Trader)
> Đây là người dùng chính của sàn. Mọi tính năng đều phục vụ cho vai trò này.

**Họ có thể làm gì:**
- Đăng ký tài khoản, đăng nhập
- Nạp tiền vào ví
- Xem giá các đồng coin theo thời gian thực
- Đặt lệnh mua / bán coin
- Xem lệnh của mình đang ở trạng thái nào
- Huỷ lệnh chưa khớp
- Xem lịch sử giao dịch
- Rút tiền về tài khoản ngân hàng
- Nhận gợi ý từ AI

### 🔴 Quản Trị Viên (Admin) *(phạm vi đồ án: đơn giản hoá)*
> Không cần xây dựng giao diện phức tạp, chỉ cần quản lý qua database hoặc endpoint đơn giản.

**Họ có thể làm gì:**
- Xem danh sách tất cả người dùng
- Xem cảnh báo rủi ro từ AI (tài khoản nghi ngờ gian lận)
- Xem toàn bộ sổ lệnh
- Xem trạng thái blockchain

### 🤖 Bot Thị Trường (Market Bot) *(nội bộ, tự động)*
> Không phải người dùng thật — là chương trình tự động nhóm viết để **tạo thanh khoản giả**, làm cho biểu đồ giá trông sinh động khi demo.

**Hoạt động:** Cứ mỗi 1-2 giây, bot sẽ tự tung một lệnh mua/bán ngẫu nhiên vào sàn, giả lập như có nhiều người đang giao dịch.

---

## 🔄 Các Luồng Nghiệp Vụ Chính (Business Flows)

---

### 📌 Luồng 1: Đăng Ký & Đăng Nhập

**Mô tả:** Người dùng tạo tài khoản và xác thực danh tính để sử dụng sàn.

```
[Người dùng vào trang web]
        ↓
[Chọn "Đăng Ký"]
        ↓
[Nhập: Email, Mật khẩu, Họ tên]
        ↓
[Hệ thống kiểm tra email đã tồn tại chưa?]
   ├── Đã tồn tại → Thông báo lỗi "Email đã được đăng ký"
   └── Chưa tồn tại → Tạo tài khoản
        ↓
[Hệ thống tự động tạo:]
   ├── Ví USDT (số dư ban đầu = 0)
   ├── Ví BTC  (số dư ban đầu = 0)
   └── Ví ETH  (số dư ban đầu = 0)
        ↓
[Hệ thống Blockchain tạo cặp khoá (Public Key / Private Key)]
   → Public Key = "địa chỉ ví" của user trên blockchain
        ↓
[Chuyển sang trang Đăng Nhập]
        ↓
[Nhập Email + Mật khẩu]
        ↓
[Hệ thống kiểm tra thông tin]
   ├── Sai → Thông báo "Email hoặc mật khẩu không đúng"
   └── Đúng → Cấp phát JWT Token (thẻ thông hành điện tử)
        ↓
[Vào được trang Dashboard]
```

**Quy tắc nghiệp vụ:**
- Mật khẩu phải có ít nhất 8 ký tự
- Email chỉ được đăng ký 1 lần duy nhất
- Token đăng nhập hết hạn sau 24 giờ (cần đăng nhập lại)

---

### 📌 Luồng 2: Nạp Tiền (Deposit)

**Mô tả:** Người dùng nạp USDT (đô la ảo) vào tài khoản để có tiền giao dịch.

> **Lưu ý đồ án:** Đây là hệ thống mô phỏng, không cần kết nối ngân hàng thật. Người dùng nhập số tiền muốn nạp và hệ thống tự cộng vào.

```
[Người dùng vào trang "Nạp Tiền"]
        ↓
[Nhập số tiền muốn nạp, ví dụ: 1,000 USDT]
        ↓
[Nhấn "Xác Nhận Nạp"]
        ↓
[Backend tạo lệnh Deposit với trạng thái "ĐANG XỬ LÝ"]
        ↓
[Module Blockchain nhận lệnh:]
   ├── Tạo 1 Transaction: "SYSTEM → UserA: +1,000 USDT"
   ├── Cho Transaction vào Mempool (hàng đợi chờ được ghi vào block)
   └── Miner đóng Block mới, ghi Transaction vào Blockchain
        ↓
[Xác nhận từ Blockchain → lệnh Deposit chuyển "HOÀN THÀNH"]
        ↓
[Số dư ví USDT của user +1,000]
        ↓
[Thông báo thành công, hiện lịch sử giao dịch]
```

**Điều người dùng thấy:**
- Số dư ví tăng ngay sau khi nạp
- Có thể xem lịch sử nạp tiền, kèm mã hash của transaction trên blockchain
- Nhấn vào mã hash → xem block tương ứng trên Block Explorer

---

### 📌 Luồng 3: Đặt Lệnh Mua/Bán (Place Order)

**Mô tả:** Đây là tính năng **cốt lõi** của sàn. Người dùng muốn mua hoặc bán một đồng coin.

#### 3a. Lệnh Thị Trường (Market Order) — Mua/bán ngay lập tức theo giá tốt nhất hiện có
```
[User xem trang Market, đang nhìn BTC/USDT]
        ↓
[Nhập số lượng BTC muốn mua, ví dụ: 0.01 BTC]
[Chọn "Market" (mua theo giá thị trường)]
[Nhấn "MUA"]
        ↓
[AI Risk Check kiểm tra lệnh:]
   ├── Số tiền có đủ không? (0.01 BTC × giá thị trường ≤ số dư ví?)
   ├── Giá có bất thường không? (Fat-finger: mua 10x giá thị trường?)
   └── Khối lượng có quá lớn không? (Whale detection)
   ↓ Nếu có vấn đề → Cảnh báo / Từ chối lệnh
   ↓ Nếu bình thường → Tiếp tục
        ↓
[Khoá số dư USDT tạm thời (locked) = 0.01 × giá BTC hiện tại]
        ↓
[Gửi lệnh vào Matching Engine]
        ↓
[Matching Engine tìm lệnh Bán khớp giá:]
   ├── Có lệnh Bán khớp → Thực hiện giao dịch ngay (xem Luồng 4)
   └── Không có → Lệnh chờ trong Order Book
```

#### 3b. Lệnh Giới Hạn (Limit Order) — Mua/bán ở mức giá tự chỉ định
```
[User nhập: Mua 0.1 BTC, giá tối đa 60,000 USDT/BTC]
        ↓
[Hệ thống khoá 6,000 USDT (= 0.1 × 60,000) trong ví]
   → Số dư "có thể dùng" giảm 6,000, nhưng "số dư thật" vẫn nguyên
        ↓
[Lệnh ngồi chờ trong Order Book]
        ↓
[Khi giá BTC giảm xuống ≤ 60,000:]
   └── Matching Engine kích hoạt → Thực hiện giao dịch (xem Luồng 4)
```

**Quy tắc nghiệp vụ:**
- Không được đặt lệnh nếu số dư ví không đủ
- Số tiền bị khoá (locked) không được dùng để đặt lệnh khác
- User có thể huỷ lệnh đang chờ bất cứ lúc nào (tiền khoá sẽ được hoàn lại)

---

### 📌 Luồng 4: Khớp Lệnh (Order Matching) — Trái tim của sàn

**Mô tả:** Đây là điều xảy ra **bên trong hệ thống**, người dùng không thấy trực tiếp nhưng cảm nhận được kết quả.

```
[Lệnh MUA mới vào: 0.1 BTC @ 60,000 USDT]
        ↓
[Matching Engine mở sổ lệnh Bán (Sell Order Book)]
[Tìm lệnh Bán có giá ≤ 60,000 USDT]
        ↓
   Ví dụ: Tìm thấy lệnh Bán của UserB: 0.05 BTC @ 59,500 USDT
        ↓
[KHỚP! Thực hiện giao dịch:]
   ├── Giá khớp = 59,500 USDT (giá của lệnh Bán đến trước)
   ├── Khối lượng khớp = 0.05 BTC (phần nhỏ hơn)
   ├── UserA (Mua): +0.05 BTC, -2,975 USDT (= 0.05 × 59,500)
   └── UserB (Bán): -0.05 BTC, +2,975 USDT
        ↓
[Cập nhật trạng thái lệnh:]
   ├── Lệnh của UserB: FILLED (khớp hết)
   └── Lệnh của UserA: PARTIAL (còn thiếu 0.05 BTC, tiếp tục chờ)
        ↓
[Tạo bản ghi Trade (lịch sử khớp lệnh)]
        ↓
[Blockchain ghi nhận giao dịch:]
   └── Transaction: "UserB → UserA: 0.05 BTC | UserA → UserB: 2,975 USDT"
        ↓
[WebSocket đẩy về Frontend:]
   ├── Biểu đồ giá cập nhật (nến mới hình thành)
   ├── Order Book cập nhật (lệnh đã khớp biến mất)
   └── Thông báo cho UserA và UserB: "Lệnh của bạn đã khớp!"
```

**Nguyên tắc ưu tiên khớp lệnh (FIFO):**
- Ưu tiên 1: **Giá tốt hơn** (Lệnh mua giá cao hơn được khớp trước; Lệnh bán giá thấp hơn được khớp trước)
- Ưu tiên 2: **Đến trước ưu tiên hơn** (Cùng giá thì lệnh đặt sớm hơn được khớp trước)

---

### 📌 Luồng 5: Rút Tiền (Withdraw)

```
[User vào trang "Rút Tiền"]
        ↓
[Nhập số tiền muốn rút, ví dụ: 500 USDT]
        ↓
[Kiểm tra:]
   ├── Số dư ≥ 500 USDT?
   └── Không có lệnh nào đang khoá tiền này?
        ↓
[Tạo lệnh Withdraw trạng thái "ĐANG XỬ LÝ"]
        ↓
[Blockchain ghi Transaction: "UserA → SYSTEM: -500 USDT"]
        ↓
[Xác nhận → Số dư -500 USDT]
[Trạng thái Withdraw → "HOÀN THÀNH"]
        ↓
[Lịch sử giao dịch ghi nhận, kèm mã hash blockchain]
```

---

### 📌 Luồng 6: AI Hỗ Trợ (2 chức năng)

---

#### 🤖 AI 1 — Kiểm Tra Rủi Ro Lệnh (Risk Check)
**Chạy khi:** Mỗi khi user đặt một lệnh mua/bán.  
**Mục đích:** Bảo vệ user khỏi lỗi nhập liệu và phát hiện hành vi bất thường.

| Tình huống | AI phát hiện | Hành động |
|---|---|---|
| User nhập mua BTC giá 600,000 USDT trong khi giá thị trường là 60,000 | **Fat-finger** (nhập sai giá 10x) | ⚠️ Cảnh báo: "Giá bạn nhập cao hơn thị trường 10 lần, bạn có chắc không?" |
| User đặt lệnh mua rồi ngay lập tức huỷ, lặp lại 20 lần trong 1 phút | **Wash trading** (thao túng giá) | 🚫 Từ chối lệnh + Ghi log cảnh báo cho Admin |
| User đặt 1 lệnh mua BTC trị giá 500,000 USDT (quá lớn so với thanh khoản) | **Whale detection** (cá voi) | ⚠️ Cảnh báo: "Lệnh lớn có thể ảnh hưởng đáng kể đến giá thị trường" |
| Số dư không đủ | Lỗi cơ bản | 🚫 Từ chối: "Số dư không đủ" |

---

#### 🤖 AI 2 — Gợi Ý Giao Dịch (Trading Recommendation)
**Chạy khi:** Sau mỗi lần khớp lệnh (chạy nền, không ảnh hưởng hiệu năng).  
**Mục đích:** Phân tích xu hướng thị trường và đưa ra lời khuyên đơn giản.

**Cách AI phân tích (đơn giản hoá cho đồ án):**
```
AI xem xét dữ liệu 100 nến gần nhất của BTC/USDT:

RSI (Relative Strength Index):
   - RSI < 30 → Coin đang bị bán quá mức → Có thể sắp tăng → GỢI Ý MUA
   - RSI > 70 → Coin đang được mua quá nhiều → Có thể sắp giảm → GỢI Ý BÁN
   - 30 ≤ RSI ≤ 70 → Thị trường bình thường → GIỮ NGUYÊN

MACD (Moving Average Convergence Divergence):
   - MACD vừa cắt lên Signal Line → Xu hướng tăng bắt đầu → ỦNG HỘ MUA
   - MACD vừa cắt xuống Signal Line → Xu hướng giảm bắt đầu → ỦNG HỘ BÁN

Volume (Khối lượng giao dịch):
   - Volume tăng đột biến kèm giá tăng → Xu hướng tăng mạnh → ỦNG HỘ MUA
   - Volume tăng đột biến kèm giá giảm → Xu hướng giảm mạnh → ỦNG HỘ BÁN
```

**Kết quả AI trả về cho người dùng:**
```
┌─────────────────────────────────────┐
│  Gợi Ý AI — BTC/USDT               │
│                                     │
│ Tín hiệu:   NÊN MUA                 │
│ Độ tin cậy: 72%                     │
│                                     │
│ Lý do:                              │
│ • RSI = 28 (đang bị bán quá mức)   │
│ • MACD vừa cắt lên Signal Line     │
│ • Khối lượng tăng 3x trong 1h      │
│                                     │
│ Đây chỉ là gợi ý, không phải       │
│ lời khuyên đầu tư tài chính.       │
└─────────────────────────────────────┘
```

---

## 📊 Sơ Đồ Tổng Quan Hệ Thống

```
                    ┌─────────────────────┐
                    │   NGƯỜI DÙNG (Web)  │
                    │   React Frontend    │
                    └──────────┬──────────┘
                               │ HTTP / WebSocket
                    ┌──────────▼──────────┐
                    │   BACKEND SERVER    │
                    │   (Golang - Gin)    │
                    │                     │
                    │  ┌───────────────┐  │
                    │  │ Auth API      │  │
                    │  │ Wallet API    │  │
                    │  │ Order API     │  │
                    │  │ Market API    │  │
                    │  │ AI Proxy API  │  │
                    │  └───────────────┘  │
                    └──┬──────┬───────┬───┘
                       │      │       │
           ┌───────────▼─┐  ┌─▼──┐  ┌▼──────────────┐
           │ PostgreSQL  │  │Redis│  │   AI Module   │
           │ (Dữ liệu   │  │(Sổ  │  │  (Go/Python)  │
           │  chính)    │  │lệnh)│  │               │
           └───────────┬─┘  └────┘  └───────────────┘
                       │
           ┌───────────▼──────────────┐
           │   MINI BLOCKCHAIN (Go)   │
           │  Block1 → Block2 → ...   │
           │  (Lưu mọi giao dịch)     │
           └──────────────────────────┘
```

---

## 📝 Danh Sách Tính Năng Cụ Thể (User Stories)

### 🏠 Trang Chủ & Xác Thực
| # | Tính năng | Chi tiết |
|---|---|---|
| US-01 | Đăng ký tài khoản | Nhập email, mật khẩu, họ tên → Nhận tài khoản mới với ví trống |
| US-02 | Đăng nhập | Nhập email + mật khẩu → Vào được các trang cần đăng nhập |
| US-03 | Đăng xuất | Nhấn Logout → Phiên đăng nhập kết thúc |
| US-04 | Quên mật khẩu | Nhập email → Đặt lại mật khẩu mới |

### 💰 Quản Lý Ví & Tiền
| # | Tính năng | Chi tiết |
|---|---|---|
| US-10 | Xem số dư | Thấy được bao nhiêu USDT, BTC, ETH đang có |
| US-11 | Nạp tiền | Nhập số USDT muốn nạp → Số dư tăng |
| US-12 | Rút tiền | Nhập số USDT muốn rút (không vượt quá số dư) → Số dư giảm |
| US-13 | Xem lịch sử nạp/rút | Danh sách tất cả lần nạp/rút kèm trạng thái và mã blockchain |

### 📈 Trang Thị Trường
| # | Tính năng | Chi tiết |
|---|---|---|
| US-20 | Xem danh sách coin | Thấy BTC, ETH kèm giá hiện tại, % thay đổi 24h |
| US-21 | Xem biểu đồ giá (Candlestick) | Biểu đồ nến thay đổi theo thời gian thực |
| US-22 | Xem sổ lệnh (Order Book) | Thấy các lệnh mua/bán đang chờ của thị trường |
| US-23 | Xem lịch sử khớp lệnh | Danh sách các giao dịch đã xảy ra gần đây |
| US-24 | Đặt lệnh mua (Market) | Mua ngay theo giá thị trường |
| US-25 | Đặt lệnh mua (Limit) | Mua khi giá chạm mức tôi muốn |
| US-26 | Đặt lệnh bán (Market) | Bán ngay theo giá thị trường |
| US-27 | Đặt lệnh bán (Limit) | Bán khi giá chạm mức tôi muốn |
| US-28 | Huỷ lệnh đang chờ | Lệnh chưa khớp có thể huỷ, tiền khoá hoàn lại |
| US-29 | Xem gợi ý từ AI | Pop-up hiển thị tín hiệu BUY/SELL/HOLD kèm lý do |

### 📂 Lịch Sử & Báo Cáo
| # | Tính năng | Chi tiết |
|---|---|---|
| US-30 | Xem lịch sử lệnh | Tất cả lệnh đã đặt, trạng thái (Chờ/Khớp/Huỷ) |
| US-31 | Xem lịch sử giao dịch | Tất cả giao dịch đã thực hiện thành công |
| US-32 | Xem danh mục tài sản | Tổng tài sản, P&L (lời/lỗ) tính bằng USDT |

### ⛓️ Blockchain Explorer
| # | Tính năng | Chi tiết |
|---|---|---|
| US-40 | Xem danh sách blocks | Thấy các block đã được đào, kèm thời gian và số TX |
| US-41 | Xem chi tiết block | Click vào block → Thấy các giao dịch bên trong |
| US-42 | Xem chi tiết transaction | Click vào TX hash → Thấy người gửi, người nhận, số tiền |

---

## ❌ NGOÀI PHẠM VI (Không làm trong đồ án này)

- ✗ Kết nối ngân hàng thật / cổng thanh toán thật
- ✗ Xác minh danh tính (KYC) thật
- ✗ Nhiều loại tiền pháp định (USD, VND, EUR...)
- ✗ Mobile App (iOS/Android)
- ✗ Margin Trading / Futures (đòn bẩy)
- ✗ Staking / Yield Farming
- ✗ Mạng blockchain thật với nhiều node
- ✗ Giao dịch với sàn thật bên ngoài

---

## 🔑 Bảng Giải Thích Thuật Ngữ (Glossary)

| Thuật ngữ | Giải thích đơn giản |
|---|---|
| **USDT** | Đô la ảo dùng trong hệ thống (1 USDT ≈ 1 USD). Dùng để mua coin khác |
| **Order Book (Sổ lệnh)** | Bảng hiển thị tất cả lệnh mua/bán đang chờ khớp của tất cả người dùng |
| **Matching Engine** | Bộ não tự động tìm lệnh mua và bán có giá khớp nhau rồi thực hiện giao dịch |
| **Limit Order** | Lệnh đặt mua/bán ở một mức giá cụ thể. Chờ cho đến khi giá đạt mức đó |
| **Market Order** | Lệnh mua/bán ngay lập tức theo giá tốt nhất hiện có trên thị trường |
| **Filled** | Trạng thái lệnh: Đã khớp hoàn toàn |
| **Partial** | Trạng thái lệnh: Khớp một phần, phần còn lại vẫn đang chờ |
| **Cancelled** | Trạng thái lệnh: Đã bị huỷ bởi người dùng |
| **Candlestick Chart** | Biểu đồ nến — hiển thị giá mở/đóng/cao/thấp của coin trong mỗi khoảng thời gian |
| **WebSocket** | Công nghệ giữ kết nối liên tục giữa web và server để cập nhật dữ liệu ngay lập tức |
| **JWT (Token)** | Mã thông hành điện tử. Sau khi đăng nhập, trình duyệt giữ token này để biết bạn là ai |
| **Blockchain** | Chuỗi các block dữ liệu nối nhau, mỗi block chứa nhiều giao dịch. Không thể sửa đổi |
| **Block** | Một "trang" trong sổ kế toán blockchain. Mỗi block chứa nhiều giao dịch |
| **Transaction Hash (TX Hash)** | Mã định danh duy nhất của mỗi giao dịch trên blockchain |
| **Mempool** | Hàng đợi các giao dịch chờ được ghi vào block |
| **Mining** | Quá trình đóng gói các giao dịch trong Mempool thành một block mới |
| **RSI** | Chỉ số kỹ thuật đo xem coin đang bị mua quá nhiều (>70) hay bán quá nhiều (<30) |
| **MACD** | Chỉ số kỹ thuật cho thấy xu hướng tăng/giảm của coin đang thay đổi |
| **Fat-finger** | Lỗi nhập nhầm số liệu (ví dụ: nhập 600,000 thay vì 60,000) |
| **Wash Trading** | Hành vi gian lận: tự mua tự bán để thao túng giá hoặc tạo khối lượng ảo |
| **Whale** | "Cá voi" — người dùng có tài sản rất lớn, lệnh của họ có thể ảnh hưởng đến giá |
| **P&L** | Profit & Loss — Lời và lỗ tính bằng số tiền |
| **Liquidity (Thanh khoản)** | Khả năng mua/bán dễ dàng mà không làm giá thay đổi mạnh |
| **Market Bot** | Chương trình tự động đặt lệnh để tạo thanh khoản ảo cho hệ thống |
| **bcrypt** | Công nghệ mã hoá mật khẩu. Mật khẩu lưu trong database không phải chữ thường |
| **Redis** | Bộ nhớ đệm cực nhanh. Sổ lệnh lưu ở đây để tốc độ khớp lệnh nhanh nhất có thể |

---

## ✅ Tóm Tắt Cho Từng Thành Viên Nhóm

### 🎨 Frontend Dev cần hiểu:
- Có **9 màn hình** cần làm/nâng cấp
- Dữ liệu giá và sổ lệnh cập nhật qua **WebSocket** (không cần reload)
- Có **AI pop-up** hiển thị gợi ý góc phải màn hình
- Form đặt lệnh gọi **Order API** và nhận phản hồi real-time

### ⚙️ Backend Dev cần hiểu:
- Có **5 nhóm API** cần viết (Auth, Wallet, Market, Order, AI)
- **Matching Engine** là module quan trọng nhất — chạy trong bộ nhớ (RAM) hoặc Redis
- **WebSocket server** cần broadcast liên tục khi có giao dịch mới
- Mọi giao dịch khớp xong phải **gọi sang module Blockchain** để ghi nhận

### ⛓️ Blockchain Dev cần hiểu:
- Blockchain chỉ ghi nhận **3 loại sự kiện**: Deposit, Withdraw, Trade
- Khi có giao dịch mới → vào **Mempool** → **Mine** → vào **Block** → **Confirm**
- Cung cấp **Block Explorer API** để Frontend hiển thị
- Tạo **cặp khoá Public/Private** cho mỗi user khi đăng ký

### 🤖 AI Dev cần hiểu:
- **AI 1 (Risk)**: Chạy trước khi lệnh vào Matching Engine — kiểm tra fat-finger, wash trading, whale
- **AI 2 (Signal)**: Chạy nền sau khi khớp lệnh, tính RSI/MACD → trả về BUY/SELL/HOLD
- Cả 2 AI đều **trả về JSON** cho Backend, không trực tiếp chạm vào database
- Cần có **bot.go**: tự động đặt lệnh ngẫu nhiên mỗi 1-2 giây để tạo dữ liệu demo

---

## 🎬 Kịch Bản Demo Ngày Bảo Vệ (Expected Demo Outcome)

> Đây là kịch bản **bước-từng-bước** mà nhóm sẽ diễn ra trước hội đồng. Mỗi bước đều gắn với **kết quả cụ thể** trên màn hình để cả nhóm biết mình cần build đúng thứ gì.

---

### 🎭 Nhân vật tham gia Demo

| Nhân vật | Thiết bị | Vai trò |
|---|---|---|
| **User A** — "Sinh viên mới" | Laptop trình chiếu chính | Người mua BTC, có 100,000 USDT |
| **User B** — "Trader kỳ cựu" | Điện thoại / Tab phụ | Người bán BTC, có sẵn 2 BTC trong ví |
| **Admin** — Nhóm trưởng | Laptop trình chiếu chính | Bơm vốn, xem báo cáo phí |

---

### 🎬 Bước 1 — Mở Màn: Giao Diện Ấn Tượng

**Hành động:** Mở trình duyệt, vào `http://localhost:3000`

**Thầy cô thấy trên màn hình:**
```
✅ Giao diện Dark mode chuyên nghiệp (nền navy đen, text trắng sáng)
✅ Biểu đồ nến (Candlestick) BTC/USDT đang nhảy số theo thời gian thực
✅ Cột Order Book bên cạnh: lệnh MUA màu XANH, lệnh BÁN màu ĐỎ
✅ Ticker giá chạy ngang phía trên (BTC: $60,120 ▲ +2.3%)
✅ Bot đang âm thầm tung lệnh → biểu đồ có thanh khoản, không trống rỗng
```

**Câu nói demo:** *"Thưa thầy cô, đây là giao diện thị trường của CryptoEX — sàn giao dịch do nhóm em tự xây dựng hoàn toàn từ đầu."*

---

### 🎬 Bước 2 — Bơm Vốn: Admin Cấp Tiền Cho User A

**Hành động:** Đăng nhập bằng tài khoản Admin → vào trang Admin Dashboard

**Thầy cô thấy trên màn hình:**
```
✅ Trang Admin hiển thị danh sách người dùng
✅ User A: số dư USDT = 0, BTC = 0
✅ Admin nhập: "Cấp 100,000 USDT cho User A" → Nhấn Xác Nhận
✅ Số dư User A cập nhật ngay: USDT = 100,000
✅ Blockchain ghi nhận: Block mới được đào chứa TX "ADMIN → UserA: +100,000 USDT"
✅ Lịch sử giao dịch của User A xuất hiện dòng: [DEPOSIT] 100,000 USDT ✓ Confirmed
```

**Câu nói demo:** *"Trong thực tế, User A sẽ nạp tiền qua ngân hàng. Ở đây em dùng quyền Admin để bơm thẳng 100,000 USDT vào ví để demo cho nhanh."*

---

### 🎬 Bước 3 — Thị Trường: User A Đặt Lệnh Mua

**Hành động:** Đăng nhập User A → vào trang Market → chọn cặp BTC/USDT

**Thầy cô thấy từng bước:**

```
1. Ví User A hiển thị: USDT = 100,000 | BTC = 0

2. User A nhập lệnh:
   Loại: LIMIT ORDER
   Hành động: MUA
   Số lượng: 1 BTC
   Giá: 60,000 USDT

3. [AI Risk Check chạy tự động — hiện trong 0.2 giây]
   ✅ Số dư đủ (cần 60,000, có 100,000) → PASS
   ✅ Giá bình thường (60,000 vs thị trường 60,120) → PASS
   ✅ Khối lượng hợp lý → PASS
   → Không có cảnh báo

4. Nhấn "MUA" → Lệnh vào hệ thống

5. NGAY LẬP TỨC trên màn hình thấy:
   ✅ Ví User A: USDT = 40,000 (khoá 60,000 cho lệnh)
                  USDT bị khoá = 60,000
   ✅ Order Book: Lệnh MUA 1 BTC @ 60,000 màu XANH xuất hiện ở đầu danh sách
   ✅ Tab "Lệnh Đang Mở" của User A: hiện 1 lệnh [BUY 1 BTC @ 60,000 — OPEN]
```

**Câu nói demo:** *"Thầy cô thấy không — lệnh xuất hiện trong Order Book ngay lập tức, và 60,000 USDT đã bị khoá lại để đảm bảo User A không tiêu số tiền này vào việc khác."*

---

### 🎬 Bước 4 — Đối Chiếu: User B Đặt Lệnh Bán

**Hành động:** Lấy điện thoại/Tab, đăng nhập User B → vào Market → BTC/USDT

**Thầy cô thấy trên Tab phụ:**
```
1. Ví User B: USDT = 5,000 | BTC = 2.0

2. User B nhập lệnh:
   Loại: LIMIT ORDER
   Hành động: BÁN
   Số lượng: 1 BTC
   Giá: 60,000 USDT

3. [AI Risk Check]
   ✅ Có đủ BTC để bán (cần 1, có 2) → PASS
   ✅ Giá hợp lý → PASS

4. Nhấn "BÁN"
```

**Câu nói demo:** *"Bây giờ em dùng điện thoại, đăng nhập User B — người đang có BTC — và đặt lệnh Bán đúng 1 BTC với giá 60,000 USDT."*

---

### 🎬 Bước 5 — MA THUẬT: Khớp Lệnh Tự Động ⚡

**Đây là khoảnh khắc wow nhất của demo.**

**Thầy cô thấy trên CẢ HAI màn hình CÙNG LÚC (trong vòng < 1 giây):**

```
LAPTOP (User A):                    ĐIỆN THOẠI (User B):
─────────────────────               ─────────────────────
Ví: USDT = 40,000                  Ví: USDT = 65,000
    BTC  = 1.0     ← NHẬN BTC          BTC  = 1.0     ← BÁN ĐI
    USDT khoá = 0  ← GIẢI PHÓNG
                                    
Tab "Lệnh Đang Mở": TRỐNG          Tab "Lệnh Đang Mở": TRỐNG
Tab "Lịch Sử":                     Tab "Lịch Sử":
[BUY 1 BTC @ 60,000 — FILLED ✓]   [SELL 1 BTC @ 60,000 — FILLED ✓]

Thông báo pop-up:                  Thông báo pop-up:
"Lệnh của bạn đã khớp!"           "Lệnh của bạn đã khớp!"
```

**Cùng lúc đó trên màn hình chính (biểu đồ thị trường):**
```
✅ Biểu đồ nến: Nến mới hình thành tại mức giá 60,000
✅ Order Book: Lệnh MUA 60,000 của User A BIẾN MẤT
✅ Lịch Sử Giao Dịch: Xuất hiện dòng mới
   [60,000 USDT | 1 BTC | vừa xong]
✅ Blockchain: Block mới được đào
   TX: "UserB → UserA: 1 BTC | UserA → UserB: 59,940 USDT"
   (59,940 = 60,000 - 60 phí 0.1%)
```

**Câu nói demo:** *"BÙM! Matching Engine của em tự nhận diện 2 lệnh có giá gặp nhau và thực hiện giao dịch trong chưa đầy 1 giây. Hoàn toàn tự động, không cần can thiệp của con người."*

---

### 🎬 Bước 6 — BLOCKCHAIN: Minh Bạch & Bất Biến

**Hành động:** Mở trang Block Explorer (hoặc click vào TX hash)

**Thầy cô thấy:**
```
Trang Block Explorer — CryptoEX Chain

Block #47
├── Hash: 0x3f8a2b1c...
├── Thời gian: 21:28:45 27/03/2026
├── Số TX: 1
└── Transactions:
    └── TX #001
        ├── Hash: 0x9d4e7f2a...
        ├── Từ: UserB (địa chỉ ví blockchain của B)
        ├── Đến: UserA (địa chỉ ví blockchain của A)
        ├── Tài sản: 1 BTC
        └── Trạng thái: CONFIRMED ✓
```

**Câu nói demo:** *"Thưa thầy cô, mọi giao dịch trên sàn đều được ghi vĩnh viễn vào Blockchain mà nhóm em tự xây. Không ai có thể sửa hay xoá lịch sử này — đây chính là bản chất của công nghệ Blockchain."*

---

### 🎬 Bước 7 — AI: Phân Tích Thông Minh

**Bước 7a — AI Trading Signal (User xem):**

**Hành động:** Quay lại trang Market, thấy pop-up AI góc phải màn hình

```
┌─────────────────────────────────────────┐
│  Gợi Ý Từ AI  — BTC/USDT               │
│                                         │
│  Tín hiệu:    NÊN GIỮ (HOLD)           │
│  Độ tin cậy:  68%                       │
│                                         │
│  Phân tích:                             │
│  • RSI = 52 (vùng trung tính)          │
│  • MACD đang hội tụ, chưa crossover    │
│  • Volume ổn định                       │
│                                         │
│  Gợi ý: Chờ tín hiệu rõ hơn trước     │
│  khi đặt lệnh tiếp theo.              │
│                                         │
│  [Cập nhật lúc 21:28:46]              │
└─────────────────────────────────────────┘
```

**Bước 7b — AI Risk Demo (thao túng giá):**

**Hành động:** User A thử đặt lệnh MUA BTC với giá 600,000 USDT (nhập nhầm thêm 0)

```
[AI Risk Check phát hiện]

⚠️ CẢNH BÁO: GIÁ BẤT THƯỜNG
────────────────────────────
Giá bạn nhập:    600,000 USDT
Giá thị trường:   60,120 USDT
Chênh lệch:       +898%

Đây có thể là lỗi nhập liệu (Fat-finger).
Bạn có CHẮC CHẮN muốn mua với giá này không?

[Huỷ]    [Xác nhận vẫn mua]
```

**Câu nói demo:** *"AI của em không chỉ đưa ra gợi ý mua/bán, mà còn bảo vệ người dùng khỏi những lỗi nghiêm trọng như nhập sai giá 10 lần — một tính năng mà ngay cả nhiều sàn thật cũng đang áp dụng."*

---

### 🎬 Bước 8 — MỞ MÀNG: Admin Báo Cáo Doanh Thu Phí

**Hành động:** Đăng nhập Admin → vào trang Revenue / Fee Report

**Thầy cô thấy:**
```
Dashboard Admin — CryptoEX

Phí Giao Dịch Thu Được Hôm Nay
────────────────────────────────
Tỷ lệ phí:    0.1% mỗi lệnh khớp

Giao dịch vừa rồi:
  Giá trị khớp:  60,000 USDT
  Phí thu (0.1%): 60 USDT
    └── UserA chịu:  30 USDT (bên Mua)
    └── UserB chịu:  30 USDT (bên Bán)

Tổng phí thu trong phiên demo: 60 USDT
Tổng số giao dịch:              1 lệnh khớp

Ví Sàn (Platform Wallet):  +60 USDT
```

**Câu nói demo:** *"Thưa thầy cô, đây là mô hình kinh doanh của sàn. Từ 1 giao dịch 60,000 USD vừa rồi, hệ thống tự động thu 60 USD phí hoa hồng (0.1%) — chia đều từ 2 phía. Đây là cách Binance, Coinbase và mọi sàn giao dịch trên thế giới kiếm tiền."*

---

## 📊 Bảng Tổng Hợp: Ai Build Gì Để Demo Chạy Được

| Bước Demo | Tính năng cần có | Member phụ trách |
|---|---|---|
| Bước 1 — Giao diện | Dark UI + Candlestick real-time + Bot chạy nền | FE + AI Dev |
| Bước 2 — Bơm vốn | Admin API + Deposit logic + Blockchain TX | Backend + Blockchain |
| Bước 3 — Đặt lệnh Mua | Order form + AI Risk Check + Order Book real-time | FE + Backend + AI |
| Bước 4 — Đặt lệnh Bán | Tương tự Bước 3 | FE + Backend + AI |
| Bước 5 — Khớp lệnh | Matching Engine + WebSocket push + Blockchain TX | Backend + Blockchain |
| Bước 6 — Blockchain | Block Explorer UI + API | FE + Blockchain |
| Bước 7 — AI | Trading Signal pop-up + Risk Warning UI | FE + AI Dev |
| Bước 8 — Báo cáo phí | Fee calculation + Admin Dashboard | Backend + FE |

---

## ✅ Checklist "Sẵn Sàng Demo" (Definition of Done)

Trước ngày bảo vệ, toàn bộ các mục sau phải được tick xanh:

### Giao diện (Frontend)
- [ ] Dark mode hoạt động, không có lỗi giao diện trắng
- [ ] Biểu đồ nến cập nhật real-time (không cần reload)
- [ ] Order Book cập nhật real-time khi có lệnh mới
- [ ] Lịch sử giao dịch tự thêm dòng khi có khớp lệnh
- [ ] Pop-up thông báo "Lệnh khớp rồi!" hiện đúng lúc
- [ ] AI pop-up gợi ý hiển thị ở góc phải màn hình
- [ ] AI cảnh báo fat-finger khi nhập giá bất thường
- [ ] Block Explorer hiển thị danh sách blocks và TX

### Hệ thống (Backend + Blockchain)
- [ ] Đăng ký / đăng nhập hoạt động (không mất session khi reload)
- [ ] Admin có thể bơm vốn cho user
- [ ] Đặt lệnh Limit/Market hoạt động cả 2 chiều Mua/Bán
- [ ] Matching Engine khớp lệnh < 1 giây
- [ ] Số dư ví cập nhật đúng sau khi khớp lệnh
- [ ] Phí 0.1% được trừ đúng từ cả 2 phía
- [ ] Blockchain ghi TX cho mỗi giao dịch khớp
- [ ] Market Bot chạy ngầm, tung lệnh mỗi 2 giây

### Dữ liệu Demo (chuẩn bị trước)
- [ ] Tài khoản Admin đã tạo sẵn
- [ ] User A đã tạo sẵn (email: usera@demo.com)
- [ ] User B đã tạo sẵn, có sẵn 2 BTC trong ví
- [ ] Bot đã chạy đủ lâu để có lịch sử giá (ít nhất 50 nến)
- [ ] URL demo đã test trên máy trình chiếu

---

*Tài liệu này được cập nhật theo tiến độ dự án. Mọi thay đổi nghiệp vụ cần được thảo luận trước khi code.*
