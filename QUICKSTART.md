# BlockAI Platform - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Configure API Keys

Edit `.env` file and add your API keys:

```bash
# Required: At least one AI provider
OPENAI_API_KEY=sk-your-openai-key-here

# Required: Ethereum Sepolia RPC URL
# Get free RPC from: https://infura.io or https://alchemy.com
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID

# Optional: Payment receiving address
PAYMENT_ADDRESS=0xYourAddressHere
```

### Step 2: Start the Platform

```bash
# Build the project (already done if you followed setup)
bun run build

# Start the server
bun run start
```

You should see:
```
🚀 BlockAI Platform is ready!
🌐 Web3 integration: Ethereum Sepolia Testnet
📍 Health check: http://localhost:3000/api/health
```

### Step 3: Test the API

#### Option A: Using cURL

```bash
# 1. Check health
curl http://localhost:3000/api/health

# 2. List available agents
curl http://localhost:3000/api/agents

# 3. Submit a task (replace with real transaction hash)
curl -X POST http://localhost:3000/api/task \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Research the latest AI trends",
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "transactionHash": "0xYOUR_REAL_TX_HASH_HERE"
  }'
```

#### Option B: Using Postman

1. Import `postman_collection.json` into Postman
2. Update the `baseUrl` variable if needed (default: `http://localhost:3000`)
3. Try the "Health Check" request first
4. Submit tasks using the example requests

---

## 📝 How to Get a Real Transaction Hash

### For Testing on Sepolia Testnet:

1. **Get Sepolia ETH** (free testnet tokens):
   - Visit: https://sepoliafaucet.com/
   - Or: https://www.alchemy.com/faucets/ethereum-sepolia
   - Enter your wallet address
   - Receive free Sepolia ETH

2. **Send a Transaction**:
   - Open MetaMask (or your wallet)
   - Switch to Sepolia Testnet
   - Send any amount to the platform's payment address
   - Copy the transaction hash (starts with `0x`)

3. **Use the Transaction Hash**:
   - Paste it in the API request
   - The platform will validate it before processing your task

---

## 🎯 Example Workflow

### 1. Research Task
```json
{
  "task": "Research quantum computing developments in 2024",
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "transactionHash": "0x..."
}
```
**Routes to**: Research Agent

### 2. Coding Task
```json
{
  "task": "Create a REST API for user authentication with JWT",
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "transactionHash": "0x..."
}
```
**Routes to**: Coding Agent

### 3. Blockchain Task
```json
{
  "task": "Check ETH balance of 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "transactionHash": "0x..."
}
```
**Routes to**: Blockchain Agent

### 4. Data Analysis Task
```json
{
  "task": "Analyze sales trends and create visualizations",
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "transactionHash": "0x..."
}
```
**Routes to**: Data Agent

---

## 🔍 Checking Task Status

After submitting a task, you'll receive a `taskId`. Use it to check status:

```bash
# Get task status
curl http://localhost:3000/api/task/task_1234567890_abc123

# Response:
{
  "success": true,
  "task": {
    "id": "task_1234567890_abc123",
    "status": "completed",  // or "validating", "processing", "failed"
    "task": "Research quantum computing...",
    "transactionHash": "0x...",
    "assignedAgents": ["orchestrator", "research"],
    "result": { ... },
    "createdAt": 1704326400000,
    "updatedAt": 1704326450000
  }
}
```

---

## 🛠️ Development Mode

For development with hot-reload:

```bash
bun run dev
```

This will:
- Watch for file changes
- Auto-rebuild on changes
- Restart the server automatically

---

## 📊 Task Status Flow

```
User submits task
       ↓
   VALIDATING (checking transaction)
       ↓
   PROCESSING (orchestrator routes to agents)
       ↓
   COMPLETED (results ready)
```

---

## ⚠️ Common Issues

### Issue: "Transaction validation failed"
**Solution**: Ensure:
- Transaction is confirmed on Sepolia
- You're using the correct network (Sepolia, not mainnet)
- Transaction was successful (not reverted)

### Issue: "Invalid wallet address"
**Solution**: 
- Use a valid Ethereum address (starts with `0x`, 42 characters total)
- Example: `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`

### Issue: "Port 3000 already in use"
**Solution**:
- Change port in `.env`: `PORT=8080`
- Or kill the process using port 3000

---

## 🎉 Next Steps

1. **Test all agent types** - Try submitting different task types
2. **Build a frontend** - Create a UI that calls these APIs
3. **Add more agents** - Extend with custom specialized agents
4. **Deploy to production** - Move from PGLite to PostgreSQL
5. **Switch to mainnet** - When ready for real transactions

---

## 📚 Additional Resources

- [Full README](./README.md)
- [API Documentation](./postman_collection.json)
- [ElizaOS Docs](https://docs.elizaos.ai)
- [Ethereum Sepolia](https://sepolia.dev)

---

**Need Help?** Check the main README or open an issue on GitHub.
