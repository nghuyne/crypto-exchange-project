# TAI LIEU DO AN - CRYPTO EXCHANGE PROJECT

## 1. Tong quan de tai

- Ten de tai: Crypto Exchange Project
- Mo ta ngan: He thong mo phong san giao dich tien ma hoa bao gom backend xu ly nghiep vu giao dich va frontend giao dien nguoi dung theo thoi gian thuc.
- Muc tieu:
  - Xay dung he thong dang ky, dang nhap va xac thuc JWT.
  - Quan ly vi tai san cho nguoi dung.
  - Dat lenh mua/ban, khop lenh tu dong, luu lich su giao dich.
  - Cung cap du lieu thi truong, thong ke tong quan.
  - Tich hop AI Risk Engine de danh gia rui ro lenh.
  - Tich hop Audit Blockchain de minh bach su kien quan trong.
  - Bo sung admin API de quan ly van hanh (user/order/config/log).

## 2. Kien truc tong the

He thong duoc tach thanh 2 thanh phan chinh:

- Frontend: React + TypeScript (SPA)
- Backend: Go (Gin) + GORM + MySQL + Redis + WebSocket

Luong tong quat:

1. Nguoi dung dang nhap -> Backend tra JWT.
2. Frontend gui JWT trong Authorization Bearer cho cac route bao ve.
3. Nguoi dung dat lenh -> Backend lock so du -> luu order -> goi matching engine.
4. Matching engine khop order theo gia va thoi gian -> tao trade -> cap nhat wallet.
5. He thong phat su kien qua WebSocket cho frontend cap nhat giao dien.
6. Cac su kien quan trong duoc ghi audit chain.

## 3. Cong nghe su dung

### 3.1 Backend

- Go 1.24+
- Gin (REST API framework)
- GORM + MySQL
- Redis (cache/orderbook support)
- JWT (auth)
- Gorilla WebSocket

### 3.2 Frontend

- React 19
- TypeScript
- React Router
- React Scripts
- ApexCharts

## 4. Cau truc thu muc chinh

```
crypto-exchange-project/
├── backend/
│   ├── docker-compose.yml
│   └── api-server/
│       ├── main.go
│       ├── config/
│       │   ├── database.go
│       │   ├── seed.go
│       │   └── ai_blockchain.go
│       ├── controllers/
│       │   ├── auth.go
│       │   ├── order.go
│       │   ├── market.go
│       │   ├── wallet.go
│       │   ├── data.go
│       │   ├── admin.go
│       │   ├── middleware.go
│       │   └── blockchain.go
│       ├── engine/
│       │   └── matching.go
│       ├── models/
│       │   └── domain.go
│       ├── ws/
│       │   └── ws.go
│       └── blockchain/
│           ├── block.go
│           └── blockchain.go
└── frontend/
    ├── src/
    │   ├── context/
    │   │   ├── AuthContext.tsx
    │   │   └── WebSocketContext.tsx
    │   ├── navigation/
    │   │   └── Navigation.tsx
    │   ├── components/
    │   ├── screens/
    │   │   ├── Market/
    │   │   ├── Wallet/
    │   │   ├── Data/
    │   │   ├── Dashboard/
    │   │   └── Transactions/
    │   └── styles/
    └── package.json
```

## 5. Thiet ke co so du lieu

He thong su dung cac bang chinh:

### 5.1 User

- id: khoa chinh
- email: duy nhat
- password: hash bcrypt
- full_name: ho ten
- role: USER, ADMIN, MODERATOR
- status: ACTIVE, SUSPENDED, BANNED
- kyc_status: PENDING, VERIFIED, REJECTED
- tier: cap tai khoan
- created_at

### 5.2 Wallet

- id, user_id, asset
- balance: so du kha dung
- locked_balance: so du bi khoa do lenh cho

### 5.3 Order

- id, user_id, symbol, side, type
- price, quantity, filled
- status: OPEN, FILLED, PARTIAL, CANCELLED
- created_at

### 5.4 Trade

- id
- buy_order_id, sell_order_id
- symbol, price, quantity
- created_at

### 5.5 AdminLog

- admin_id, action, target_id, details
- dung de truy vet cac thao tac quan tri

### 5.6 SystemConfig

- config_key, value, updated_by, updated_at
- dung cho fee/limit/cau hinh van hanh

## 6. Chuc nang backend

### 6.1 Auth

- Dang ky: tao user moi + tao wallet mac dinh
- Dang nhap: xac thuc mat khau bcrypt, cap JWT 24h
- GetMe: lay thong tin user tu token
- Middleware:
  - AuthRequired: bat buoc JWT hop le
  - AdminRequired: chi cho role ADMIN/MODERATOR

### 6.2 Dat lenh va khop lenh

- Endpoint dat lenh: POST /api/v1/orders
- Luong xu ly:
  1. Validate input
  2. AI risk check (fail-closed)
  3. Lock so du wallet theo side BUY/SELL
  4. Tao order OPEN
  5. Trigger matching engine cho symbol

### 6.3 Matching engine

- Sap xep BUY theo gia giam dan, SELL theo gia tang dan
- Kiem tra dieu kien khop: buy.price >= sell.price
- Tinh so luong khop theo phan con lai
- Update order status/fill
- Chuyen tai san giua 2 ben trong wallet
- Tao ban ghi trade
- Broadcast su kien TRADE_EXECUTED qua WebSocket

### 6.4 Wallet module

- Lay danh sach wallet cua user
- Deposit (test endpoint)
- Transaction history theo user (BUY/SELL side)
- Risk assessment + insights cho wallet

### 6.5 Market module

- Order book theo symbol
- Market trades (50 giao dich moi nhat)
- Mapping maker/taker va thong tin masked user

### 6.6 Data module

- Overview
- Coins
- Heatmap
- Sentiment

Muc dich la cung cap dashboard tong quan tuong tu san thuc te.

### 6.7 Blockchain audit

- Luu cac su kien audit vao blockchain noi bo
- Public endpoint de truy xuat blocks

### 6.8 Admin API

- Dashboard thong ke:
  - tong user, user active, tong order, tong trade, tong volume
- User management:
  - list user + filter
  - suspend/resume user
  - verify/reject KYC
- Order management:
  - list order toan san
  - force cancel order
- System config:
  - get/update cac key cau hinh
- Admin logs:
  - lich su hanh dong admin, co filter

### 6.9 Debug API (phuc vu phat trien)

- GET /api/v1/debug/stats
- POST /api/v1/debug/reseed

Giup kiem tra nhanh du lieu va seed lai bo data demo.

## 7. Chuc nang frontend

### 7.1 Xac thuc va trang thai nguoi dung

- AuthContext quan ly token + user + login/logout/register
- Khi khoi dong app, neu co token se goi /api/v1/me de phuc hoi session
- ProtectedRoute chan truy cap route neu chua dang nhap

### 7.2 Market screen

- Hien thi market widget, candlestick, buy/sell, order book, trade history
- Co polling/real-time cap nhat theo du lieu backend

### 7.3 Wallet screen

Wallet duoc chia thanh 3 khoi:

1. Header:
- Tong tai san theo USDT + quy doi VND
- AI risk score bar
- Action buttons

2. Asset table:
- Danh sach tai san, so du total/available, gia tri USDT
- Nut Trade chuyen qua market pair

3. Footer (tabs):
- Transaction History: lay /wallet/user-trades
- AI Insights: lay /wallet/risk-assessment

### 7.4 Data, Dashboard, Transactions, Blockchain Explorer

- Cung cap giao dien thong ke, lich su va tham chieu du lieu he thong.

## 8. Danh sach API chinh

### 8.1 Public

- POST /api/v1/register
- POST /api/v1/login
- GET /api/v1/market/orderbook
- GET /api/v1/market/trades
- GET /api/v1/data/overview
- GET /api/v1/data/coins
- GET /api/v1/data/heatmap
- GET /api/v1/data/sentiment
- GET /api/v1/blockchain/blocks
- GET /api/v1/debug/stats
- POST /api/v1/debug/reseed
- GET /ws

### 8.2 Auth required

- GET /api/v1/me
- GET /api/v1/wallet
- GET /api/v1/wallet/user-trades
- GET /api/v1/wallet/risk-assessment
- POST /api/v1/deposit
- POST /api/v1/orders
- GET /api/v1/orders
- DELETE /api/v1/orders/:id

### 8.3 Admin required

- GET /api/v1/admin/dashboard
- GET /api/v1/admin/users
- POST /api/v1/admin/users/suspend
- POST /api/v1/admin/users/resume
- POST /api/v1/admin/users/verify-kyc
- GET /api/v1/admin/orders
- POST /api/v1/admin/orders/cancel
- GET /api/v1/admin/config
- POST /api/v1/admin/config/update
- GET /api/v1/admin/logs

## 9. Trien khai local

### 9.1 Yeu cau

- Go 1.24+
- Node.js 18+
- npm
- Docker Desktop (khuyen nghi)

### 9.2 Chay backend infrastructure

Tai thu muc backend:

```bash
docker compose up -d
```

Thong so mac dinh:

- MySQL host: 127.0.0.1
- MySQL port: 3310 tu host map vao 3306 container
- Redis port: 6379

Luu y: backend config dang mac dinh MYSQL_PORT=3306, vi vay nen set env khi chay local neu dung docker-compose map 3310.

Vi du:

```bash
set MYSQL_HOST=127.0.0.1
set MYSQL_PORT=3310
set MYSQL_USER=root
set MYSQL_PASSWORD=root
set MYSQL_DB=cryptoex
```

### 9.3 Chay backend API

Tai thu muc backend/api-server:

```bash
go mod tidy
go run .
```

Server mac dinh: http://localhost:8080

### 9.4 Chay frontend

Tai thu muc frontend:

```bash
npm install
npm start
```

Frontend mac dinh: http://localhost:3000

Proxy da duoc cau hinh sang backend 8080 trong package.json.

## 10. Tai khoan demo

Du lieu seed co san:

- Admin:
  - Email: admin@cryptoex.com
  - Password: admin123
- User demo:
  - alice.demo@cryptoex.com / 123456
  - bob.demo@cryptoex.com / 123456
  - carol.demo@cryptoex.com / 123456

## 11. Kiem thu nghiep vu de xuat

### 11.1 Auth

- Dang ky user moi
- Dang nhap va lay token
- Goi /me voi token hop le va khong hop le

### 11.2 Order lifecycle

- Dat BUY va SELL cung symbol
- Kiem tra lock/unlock wallet
- Kiem tra order status OPEN -> PARTIAL/FILLED
- Kiem tra trade duoc tao dung

### 11.3 Wallet page

- Kiem tra transaction history update sau khi khop lenh
- Kiem tra AI insights va risk score

### 11.4 Admin

- Dang nhap bang admin account
- Suspend/resume user
- Verify KYC
- Cap nhat config key
- Kiem tra admin logs sinh ra day du

## 12. Danh gia hien trang do an

### 12.1 Diem manh

- Da co day du vong doi giao dich co ban (order -> matching -> trade -> wallet)
- Co co che auth JWT va middleware role
- Co module wallet va transaction history theo user
- Co admin API cho van hanh can ban
- Co audit chain + AI risk check

### 12.2 Han che

- Frontend admin dashboard chua hoan thien route/man hinh tuong ung
- Fee tu config chua tich hop truc tiep vao processTrade
- Thi truong gia va ty gia mot so cho con hardcode
- Chua co bo test tu dong unit/integration day du
- Security hardening (rate limit, refresh token, key management) can nang cap

## 13. Huong phat trien tiep theo

- Hoan thien giao dien admin:
  - dashboard users/orders/config/logs
- Day du hoa quy trinh nap/rut va approval queue
- Ap dung config fee vao matching/trade settlement
- Them alert realtime cho su kien bat thuong (risk high, volume dot bien)
- Tich hop 2FA, refresh token rotation, audit bao mat nang cao
- Viet test tu dong cho controller + engine + middleware
- Chuan hoa logging/monitoring (structured logs, metrics, tracing)

## 14. Ket luan

Crypto Exchange Project da dat duoc muc tieu cot loi cua mot san giao dich mo phong:

- Co auth, wallet, order/trade lifecycle, market data, websocket, risk va audit.
- Co bo API quan tri de san sang cho van hanh thuc te cap co ban.
- Co kha nang mo rong manh len production architecture khi bo sung testing, security hardening, va frontend admin.

Tai lieu nay co the dung lam co so cho:

- Bao cao mon hoc/do an tot nghiep
- Chuyen giao ky thuat noi bo
- Lap roadmap phat trien phien ban tiep theo
