# 🤖 BlockAI Platform

> **Web3-Powered Multi-Agent AI Assistant** built with ElizaOS and free local AI models

A sophisticated AI platform that combines **multi-agent orchestration**, **Web3 transaction validation**, and **100% free local AI** to create a powerful, cost-effective assistant system.

[![ElizaOS](https://img.shields.io/badge/ElizaOS-1.7.0-blue)](https://github.com/elizaos/eliza)
[![Ollama](https://img.shields.io/badge/Ollama-Free%20AI-green)](https://ollama.com)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## ✨ Features

### 🎯 Multi-Agent System
- **Orchestrator** - Master coordinator for intelligent task routing
- **Research Agent** - Information gathering and analysis
- **Coding Agent** - Code generation and debugging
- **Blockchain Agent** - Web3 and smart contract interactions
- **Data Agent** - Data analysis and visualization

### ⛓️ Web3 Integration
- Ethereum Sepolia testnet transaction validation
- Payment verification before task execution
- Wallet integration and balance checking
- Gas estimation and optimization

### 🆓 Free Local AI
- **No API costs** - Runs 100% locally with Ollama
- **No rate limits** - Unlimited usage
- **Privacy-first** - All data stays on your machine
- **Offline capable** - Works without internet

### 🌐 REST API
- Task submission with transaction validation
- Real-time status tracking
- Agent management endpoints
- Comprehensive error handling

## 🚀 Quick Start

### Prerequisites

- **Bun** v1.0+ ([Install Bun](https://bun.sh))
- **Ollama** ([Install Ollama](https://ollama.com/download))
- **Node.js** v18+ (optional, for npm compatibility)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/dhruvpal102005/PAAI_eliza.git
   cd blockai-platform
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Install Ollama models**
   ```bash
   # Text generation model
   ollama pull gemma2:2b
   
   # Embedding model
   ollama pull nomic-embed-text
   ```

4. **Configure environment**
   ```bash
   # Copy example env file
   cp .env.example .env
   
   # Edit .env and add your configuration
   # Ollama is pre-configured - just add Web3 settings if needed
   ```

5. **Start the platform**
   ```bash
   bun run start
   ```

6. **Access the web interface**
   ```
   http://localhost:3000
   ```

## 📖 Documentation

- **[Quick Start Guide](QUICKSTART.md)** - Get up and running in 5 minutes
- **[Ollama Setup Guide](.gemini/antigravity/brain/.../ollama_setup_guide.md)** - Free local AI configuration
- **[API Documentation](README.md#api-endpoints)** - REST API reference
- **[Postman Collection](postman_collection.json)** - Ready-to-use API tests

## 🔧 Configuration

### Environment Variables

```bash
# AI Provider (Ollama is default - FREE!)
OLLAMA_API_ENDPOINT=http://localhost:11434/api
OLLAMA_SMALL_MODEL=gemma2:2b
OLLAMA_EMBEDDING_MODEL=nomic-embed-text

# Web3 (Optional - for transaction validation)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR-PROJECT-ID
PAYMENT_ADDRESS=0xYourEthereumAddress

# Database
PGLITE_DATA_DIR=./.eliza/.elizadb

# Server
PORT=3000
LOG_LEVEL=info
```

### Switching AI Providers

**Using OpenAI** (requires API key):
```bash
OPENAI_API_KEY=sk-your-key-here
# Comment out Ollama settings
```

**Using Anthropic Claude** (requires API key):
```bash
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

**Using Ollama** (FREE - default):
```bash
# Already configured! Just install models:
ollama pull gemma2:2b
ollama pull nomic-embed-text
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Web Interface                        │
│                  (http://localhost:3000)                │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                  REST API Server                        │
│         (Express + ElizaOS Integration)                 │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                  Orchestrator Agent                     │
│         (Task Routing + Web3 Validation)                │
└──┬──────────┬──────────┬──────────┬─────────────────────┘
   │          │          │          │
   ▼          ▼          ▼          ▼
┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐
│Research│ │Coding│ │Blockchain│ │Data│
│ Agent │ │Agent │ │  Agent  │ │Agent│
└───┬───┘ └───┬──┘ └────┬────┘ └──┬──┘
    │         │         │          │
    └─────────┴─────────┴──────────┘
                  │
         ┌────────▼─────────┐
         │  Ollama (Local)  │
         │  gemma2:2b       │
         └──────────────────┘
```

## 📡 API Endpoints

### Health Check
```bash
GET /api/health
```

### List Agents
```bash
GET /api/agents
```

### Submit Task
```bash
POST /api/task
Content-Type: application/json

{
  "task": "Research the latest AI trends",
  "walletAddress": "0xYourAddress",
  "transactionHash": "0xYourTxHash"
}
```

### Get Task Status
```bash
GET /api/task/:id
```

### Validate Transaction
```bash
POST /api/validate
Content-Type: application/json

{
  "transactionHash": "0xYourTxHash"
}
```

## 🧪 Testing

### Using Postman
Import the provided `postman_collection.json` file.

### Using cURL
```bash
# Health check
curl http://localhost:3000/api/health

# List agents
curl http://localhost:3000/api/agents

# Submit task (requires Sepolia testnet transaction)
curl -X POST http://localhost:3000/api/task \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Research AI trends",
    "walletAddress": "0xYourAddress",
    "transactionHash": "0xYourTxHash"
  }'
```

## 🛠️ Development

### Build
```bash
bun run build
```

### Type Check
```bash
bun run type-check
```

### Lint
```bash
bun run lint
```

### Run Tests
```bash
bun test
```

## 🌟 Key Technologies

- **[ElizaOS](https://github.com/elizaos/eliza)** - Multi-agent AI framework
- **[Ollama](https://ollama.com)** - Local AI runtime
- **[Bun](https://bun.sh)** - Fast JavaScript runtime
- **[Express](https://expressjs.com)** - REST API framework
- **[ethers.js](https://ethers.org)** - Ethereum library
- **[PGLite](https://github.com/electric-sql/pglite)** - Embedded PostgreSQL

## 💡 Use Cases

- **Research Assistant** - Gather and synthesize information
- **Code Helper** - Generate, debug, and refactor code
- **Web3 Queries** - Check balances, analyze transactions
- **Data Analysis** - Process and visualize datasets
- **Multi-Agent Workflows** - Complex tasks requiring multiple specialists

## 🔒 Security

- ✅ Environment variables for sensitive data
- ✅ `.gitignore` configured to exclude secrets
- ✅ Web3 transaction validation
- ✅ Local AI processing (data never leaves your machine)
- ⚠️ **Testnet only** - Not configured for mainnet

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🆘 Troubleshooting

### Ollama Not Responding
```bash
# Check if Ollama is running
ollama list

# Restart Ollama service
# Windows: Restart from Start Menu
# Mac/Linux: ollama serve
```

### Port Already in Use
The server will automatically find an available port. Check the terminal output for the actual port number.

### OpenAI 401 Errors
Make sure you're using Ollama (free) or have a valid OpenAI API key in `.env`.

### Slow Responses
- Try a smaller model: `ollama pull phi3:mini`
- Update `.env`: `OLLAMA_SMALL_MODEL=phi3:mini`
- Or use a larger model if you have a good GPU: `ollama pull gemma2:7b`

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check the [documentation](QUICKSTART.md)
- Review the [Ollama setup guide](.gemini/antigravity/brain/.../ollama_setup_guide.md)

---

**Built with ❤️ using ElizaOS and Ollama**

*Empowering developers with free, local, and powerful AI*
