package models

import "time"

// 1. BANG NGUOI DUNG
type User struct {
	ID        uint      `gorm:"primaryKey"`
	Email     string    `gorm:"type:varchar(100);uniqueIndex;not null"`
	Password  string    `gorm:"not null"` // Se bi bam (ma hoa) bang bang bcrypt
	FullName  string    `gorm:"not null"`
	CreatedAt time.Time `gorm:"autoCreateTime"`

	// Moi quan he: 1 User co nhieu Wallet va nhieu Orders
	Wallets []Wallet `gorm:"foreignKey:UserID"`
	Orders  []Order  `gorm:"foreignKey:UserID"`
}

// 2. BANG VI TIEN
type Wallet struct {
	ID            uint    `gorm:"primaryKey"`
	UserID        uint    `gorm:"index;not null"`
	Asset         string  `gorm:"type:varchar(10);not null"`    // VD: "USDT", "BTC"
	Balance       float64 `gorm:"type:decimal(18,8);default:0"` // So du co the xai
	LockedBalance float64 `gorm:"type:decimal(18,8);default:0"` // So du bi khoa dang doi lenh
}

// 3. BANG LENH GIAO DICH (ORDER)
type Order struct {
	ID        uint      `gorm:"primaryKey"`
	UserID    uint      `gorm:"index;not null"`
	Symbol    string    `gorm:"type:varchar(20);not null"`            // vd: "btc_usdt"
	Side      string    `gorm:"type:enum('BUY','SELL');not null"`     // mua hoac ban
	Type      string    `gorm:"type:enum('LIMIT','MARKET');not null"` // lenh gioi han / lenh cho
	Price     float64   `gorm:"type:decimal(18,8);not null"`
	Quantity  float64   `gorm:"type:decimal(18,8);not null"`
	Filled    float64   `gorm:"type:decimal(18,8);default:0"` // so luong da khop
	Status    string    `gorm:"type:enum('OPEN','FILLED','PARTIAL','CANCELLED');default:'OPEN'"`
	CreatedAt time.Time `gorm:"autoCreateTime"`
}

// 4. BANG LICH SU KHOP LENH (TRADE)
type Trade struct {
	ID          uint      `gorm:"primaryKey"`
	BuyOrderID  uint      `gorm:"index;not null"`
	SellOrderID uint      `gorm:"index;not null"`
	Symbol      string    `gorm:"type:varchar(20);not null"`
	Price       float64   `gorm:"type:decimal(18,8);not null"`
	Quantity    float64   `gorm:"type:decimal(18,8);not null"`
	CreatedAt   time.Time `gorm:"autoCreateTime"`
}
