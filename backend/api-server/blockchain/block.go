package blockchain

import (
	"crypto/sha256"
	"fmt"
	"time"
)

// Block đại diện cho một khối trong chuỗi kiểm toán AI
type Block struct {
	Index         int
	Timestamp     int64
	Transactions  []*Transaction
	PrevBlockHash []byte
	Hash          []byte
	Nonce         int
}

// Transaction trong Blockchain đóng vai trò là bản ghi Audit
type Transaction struct {
	ID   []byte
	Data string // Chứa JSON metadata về rủi ro AI
}

// NewBlock tạo một block mới
func NewBlock(transactions []*Transaction, prevBlockHash []byte, index int) *Block {
	block := &Block{
		Index:         index,
		Timestamp:     time.Now().Unix(),
		Transactions:  transactions,
		PrevBlockHash: prevBlockHash,
		Hash:          []byte{},
		Nonce:         0,
	}
	block.Hash = block.calculateHash()
	return block
}

func (b *Block) calculateHash() []byte {
	// Serialize tung transaction bang gia tri thuc (ID + Data), KHONG dung %s tren pointer.
	// Tai sao? fmt.Sprintf("%s", []*Transaction) in dia chi bo nho thay vi content —
	// thay doi moi lan restart -> cung data cho hash khac nhau -> Validate() fail.
	// Manual concat voi separator ngan prefix-collision: "10"+"1" != "1"+"01".
	txData := ""
	for _, tx := range b.Transactions {
		// %x hex-encode []byte ID thanh string on dinh, khong phu thuoc pointer layout
		txData += fmt.Sprintf("%x|%s#", tx.ID, tx.Data)
	}
	record := fmt.Sprintf("%d|%d|%s|%x|%d",
		b.Index, b.Timestamp, txData, b.PrevBlockHash, b.Nonce)
	h := sha256.New()
	h.Write([]byte(record))
	return h.Sum(nil)
}

// NewGenesisBlock tạo khối gốc cho sàn giao dịch
func NewGenesisBlock() *Block {
	tx := &Transaction{ID: []byte("genesis"), Data: "NexChain System Start"}
	return NewBlock([]*Transaction{tx}, []byte{}, 0)
}
