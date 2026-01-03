import { AgentRuntime, elizaLogger } from "@elizaos/core";
// @ts-ignore - plugin-sql has type declaration issues with package.json exports
import { SqlDatabaseAdapter } from "@elizaos/plugin-sql";
import { startServer } from "./api/server";

// Import characters
import { orchestratorCharacter } from "./characters/orchestrator";
import { researchAgent } from "./characters/researchAgent";
import { codingAgent } from "./characters/codingAgent";
import { blockchainAgent } from "./characters/blockchainAgent";
import { dataAgent } from "./characters/dataAgent";

// Import actions
import { validateTransactionAction } from "./actions/validateTransaction";
import { routeTaskAction } from "./actions/routeTask";

/**
 * Initialize the multi-agent system
 */
async function initializeAgents() {
  elizaLogger.log("🤖 Initializing BlockAI multi-agent system...");

  // Database adapter (using PGLite by default)
  const databaseAdapter = new SqlDatabaseAdapter({
    dataDir: process.env.PGLITE_DATA_DIR || "./.eliza/.elizadb"
  });

  await databaseAdapter.init();
  elizaLogger.log("✅ Database initialized");

  // Create orchestrator runtime
  const orchestratorRuntime = new AgentRuntime({
    character: orchestratorCharacter,
    adapter: databaseAdapter
  });

  // Register custom actions for orchestrator
  orchestratorRuntime.registerAction(validateTransactionAction);
  orchestratorRuntime.registerAction(routeTaskAction);

  await orchestratorRuntime.initialize();
  elizaLogger.log("✅ Orchestrator agent initialized");

  // Create specialized agent runtimes
  const researchRuntime = new AgentRuntime({
    character: researchAgent,
    adapter: databaseAdapter
  });
  await researchRuntime.initialize();
  elizaLogger.log("✅ Research agent initialized");

  const codingRuntime = new AgentRuntime({
    character: codingAgent,
    adapter: databaseAdapter
  });
  await codingRuntime.initialize();
  elizaLogger.log("✅ Coding agent initialized");

  const blockchainRuntime = new AgentRuntime({
    character: blockchainAgent,
    adapter: databaseAdapter
  });
  await blockchainRuntime.initialize();
  elizaLogger.log("✅ Blockchain agent initialized");

  const dataRuntime = new AgentRuntime({
    character: dataAgent,
    adapter: databaseAdapter
  });
  await dataRuntime.initialize();
  elizaLogger.log("✅ Data agent initialized");

  return {
    orchestrator: orchestratorRuntime,
    research: researchRuntime,
    coding: codingRuntime,
    blockchain: blockchainRuntime,
    data: dataRuntime
  };
}

/**
 * Main entry point
 */
async function main() {
  try {
    elizaLogger.log("🚀 Starting BlockAI Platform...");

    // Check required environment variables
    if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
      throw new Error("At least one AI provider API key is required (OPENAI_API_KEY or ANTHROPIC_API_KEY)");
    }

    if (!process.env.SEPOLIA_RPC_URL) {
      elizaLogger.warn("⚠️  SEPOLIA_RPC_URL not set. Using default Infura endpoint.");
    }

    // Initialize agents
    const agents = await initializeAgents();

    elizaLogger.log("✅ All agents initialized successfully");
    elizaLogger.log(`📊 Active agents: ${Object.keys(agents).length}`);

    // Start API server
    startServer();

    elizaLogger.log("✅ BlockAI Platform is ready!");
    elizaLogger.log("🌐 Web3 integration: Ethereum Sepolia Testnet");
    elizaLogger.log("💡 Submit tasks via POST /api/task with transaction hash");

  } catch (error) {
    elizaLogger.error("❌ Failed to start BlockAI Platform:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  elizaLogger.log("\n👋 Shutting down BlockAI Platform...");
  process.exit(0);
});

process.on('SIGTERM', () => {
  elizaLogger.log("\n👋 Shutting down BlockAI Platform...");
  process.exit(0);
});

// Start the application
main();
