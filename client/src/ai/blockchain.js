// Persistent lightweight mock Blockchain for Experiential Learning Proofs
export class Block {
  constructor(index, timestamp, data, previousHash = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data; // e.g. { milestone: "Gravity Lab: Vacuum Fall Verified", studentId: "..." }
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    const stringToHash = 
      this.index + 
      this.timestamp + 
      JSON.stringify(this.data) + 
      this.previousHash;
    
    // Simple hash solver (polynomial rolling hash)
    let hash = 0;
    for (let i = 0; i < stringToHash.length; i++) {
      const char = stringToHash.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).toUpperCase();
  }
}

export class Blockchain {
  constructor() {
    this.chain = this.loadChain();
  }

  // Create genesis block if chain is empty
  createGenesisBlock() {
    return new Block(0, new Date().toISOString(), { milestone: "Genesis Block: NovaMind XR Accreditations Live" }, "0");
  }

  loadChain() {
    try {
      const saved = localStorage.getItem('novamind_blockchain');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Reconstruct Block objects
        return parsed.map(b => {
          const block = new Block(b.index, b.timestamp, b.data, b.previousHash);
          block.hash = b.hash; // Preserve loaded hash
          return block;
        });
      }
    } catch (e) {
      console.warn("Could not load blockchain from localStorage, creating fresh:", e);
    }
    
    const genesis = this.createGenesisBlock();
    const freshChain = [genesis];
    this.saveChain(freshChain);
    return freshChain;
  }

  saveChain(chain = this.chain) {
    try {
      localStorage.setItem('novamind_blockchain', JSON.stringify(chain));
    } catch (e) {
      console.error("Failed to save blockchain to localStorage:", e);
    }
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(milestoneData) {
    const latest = this.getLatestBlock();
    const newIndex = latest.index + 1;
    const newTimestamp = new Date().toISOString();
    
    // Check if this milestone was already recorded recently to prevent duplicates
    const isDuplicate = this.chain.some(b => 
      b.data && 
      b.data.milestone === milestoneData.milestone &&
      b.data.studentId === milestoneData.studentId
    );
    if (isDuplicate) {
      return latest;
    }

    const newBlock = new Block(newIndex, newTimestamp, milestoneData, latest.hash);
    this.chain.push(newBlock);
    this.saveChain();
    return newBlock;
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Re-calculate hash to ensure block data wasn't tampered
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      // Check link
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }
}

export const learningLedger = new Blockchain();
