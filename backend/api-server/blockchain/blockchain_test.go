package blockchain

import (
	"os"
	"testing"
)

// TestBlockchainCreation tests creating a new blockchain
func TestBlockchainCreation(t *testing.T) {
	// Clean up any existing db file
	defer os.Remove("blockchain_audit.db")

	bc := NewBlockchain()

	if bc == nil {
		t.Error("Expected blockchain instance, got nil")
	}

	if len(bc.Blocks) == 0 {
		t.Error("Expected genesis block to be created")
	}

	if len(bc.Blocks) != 1 {
		t.Errorf("Expected 1 genesis block, got %d", len(bc.Blocks))
	}
}

// TestAddAuditRecord tests adding audit records to blockchain
func TestAddAuditRecord(t *testing.T) {
	defer os.Remove("blockchain_audit.db")

	bc := NewBlockchain()
	initialLen := len(bc.Blocks)

	// Add audit record
	metadata := "Test audit data"
	err := bc.AddAuditRecord(metadata)

	if err != nil {
		t.Errorf("Failed to add audit record: %v", err)
	}

	if len(bc.Blocks) != initialLen+1 {
		t.Errorf("Expected %d blocks, got %d", initialLen+1, len(bc.Blocks))
	}
}

// TestBlockStructure tests block data structure
func TestBlockStructure(t *testing.T) {
	defer os.Remove("blockchain_audit.db")

	bc := NewBlockchain()

	if len(bc.Blocks) == 0 {
		t.Error("Blockchain should have genesis block")
		return
	}

	genesisBlock := bc.Blocks[0]

	if genesisBlock.Index != 0 {
		t.Errorf("Expected genesis block index 0, got %d", genesisBlock.Index)
	}

	if len(genesisBlock.Hash) == 0 {
		t.Error("Genesis block should have hash")
	}

	if genesisBlock.PrevBlockHash != nil && len(genesisBlock.PrevBlockHash) > 0 {
		t.Error("Genesis block should have empty PrevBlockHash")
	}
}

// TestBlockchainValidation tests blockchain validation
func TestBlockchainValidation(t *testing.T) {
	defer os.Remove("blockchain_audit.db")

	bc := NewBlockchain()

	// Add some audit records
	for i := 0; i < 3; i++ {
		err := bc.AddAuditRecord("Audit record " + string(rune(i)))
		if err != nil {
			t.Errorf("Failed to add audit record %d: %v", i, err)
		}
	}

	// Validate blockchain integrity
	if !bc.Validate() {
		t.Error("Blockchain validation failed")
	}
}

// TestMultipleAuditRecords tests adding multiple audit records
func TestMultipleAuditRecords(t *testing.T) {
	defer os.Remove("blockchain_audit.db")

	bc := NewBlockchain()

	for i := 0; i < 5; i++ {
		err := bc.AddAuditRecord("Record " + string(rune(i)))
		if err != nil {
			t.Errorf("Failed to add record %d: %v", i, err)
		}
	}

	// Should have 6 blocks (genesis + 5 records)
	if len(bc.Blocks) != 6 {
		t.Errorf("Expected 6 blocks, got %d", len(bc.Blocks))
	}
}

// TestBlockHashConsistency tests block hash consistency
func TestBlockHashConsistency(t *testing.T) {
	defer os.Remove("blockchain_audit.db")

	bc := NewBlockchain()

	err := bc.AddAuditRecord("Test data")
	if err != nil {
		t.Fatalf("Failed to add record: %v", err)
	}

	newBlock := bc.Blocks[1]

	if len(newBlock.Hash) == 0 {
		t.Error("Block hash should not be empty")
	}

	if len(newBlock.PrevBlockHash) == 0 {
		t.Error("Block PrevBlockHash should not be empty")
	}
}

// TestAuditRecordMetadata tests audit record metadata storage
func TestAuditRecordMetadata(t *testing.T) {
	defer os.Remove("blockchain_audit.db")

	bc := NewBlockchain()

	testData := "Test audit metadata with JSON"
	err := bc.AddAuditRecord(testData)
	if err != nil {
		t.Fatalf("Failed to add audit record: %v", err)
	}

	newBlock := bc.Blocks[1]
	if len(newBlock.Transactions) == 0 {
		t.Error("Block should contain transactions")
		return
	}

	tx := newBlock.Transactions[0]
	if tx.Data != testData {
		t.Errorf("Expected metadata %s, got %s", testData, tx.Data)
	}
}

// TestBlockchainPersistence tests blockchain persistence to disk
func TestBlockchainPersistence(t *testing.T) {
	defer os.Remove("blockchain_audit.db")

	// Create and populate blockchain
	bc1 := NewBlockchain()
	bc1.AddAuditRecord("Record 1")
	bc1.AddAuditRecord("Record 2")

	expectedLen := len(bc1.Blocks)

	// Create new blockchain instance - should load from disk
	bc2 := NewBlockchain()

	if len(bc2.Blocks) != expectedLen {
		t.Errorf("Expected %d blocks after loading, got %d", expectedLen, len(bc2.Blocks))
	}
}
