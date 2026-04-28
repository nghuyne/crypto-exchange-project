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
	record := fmt.Sprintf("%d%d%s%x%d", b.Index, b.Timestamp, b.Transactions, b.PrevBlockHash, b.Nonce)
	h := sha256.New()
	h.Write([]byte(record))
	return h.Sum(nil)
}

// NewGenesisBlock tạo khối gốc cho sàn giao dịch
func NewGenesisBlock() *Block {
	tx := &Transaction{ID: []byte("genesis"), Data: "NexChain System Start"}
	return NewBlock([]*Transaction{tx}, []byte{}, 0)
}
