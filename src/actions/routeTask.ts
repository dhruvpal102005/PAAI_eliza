import {
    type Action,
    type IAgentRuntime,
    type Memory,
    type State,
    type HandlerCallback,
    elizaLogger
} from "@elizaos/core";

// Agent type definitions
type AgentType = 'research' | 'coding' | 'blockchain' | 'data';

interface TaskRouting {
    agents: AgentType[];
    reasoning: string;
    estimatedComplexity: 'low' | 'medium' | 'high';
}

const routeTaskTemplate = `
Analyze the following task and determine which specialized agent(s) should handle it.

Available Agents:
- research: Information gathering, web search, data synthesis, fact-checking, trend analysis
- coding: Code generation, debugging, refactoring, technical implementation
- blockchain: Web3 interactions, smart contracts, DeFi, blockchain queries
- data: Data analysis, statistics, visualization, pattern recognition

Task: {{task}}

Analyze the task and respond with:
1. Which agent(s) should handle this (one or more)
2. Why these agents are appropriate
3. Estimated complexity (low/medium/high)

Response format:
AGENTS: [agent1, agent2, ...]
REASONING: Brief explanation
COMPLEXITY: low/medium/high
`;

export const routeTaskAction: Action = {
    name: "ROUTE_TASK",
    similes: ["DELEGATE_TASK", "ASSIGN_TASK", "DISTRIBUTE_TASK"],
    description: "Routes tasks to appropriate specialized agents based on requirements",

    validate: async (runtime: IAgentRuntime, message: Memory, state?: State) => {
        // This action is valid for the orchestrator when a task needs routing
        return runtime.character.name === "Orchestrator";
    },

    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        options: any,
        callback?: HandlerCallback
    ): Promise<void> => {
        elizaLogger.log("Routing task to specialized agents...");

        try {
            // Check if transaction is validated (if required)
            const requiresPayment = state?.transactionValidation === undefined;

            if (requiresPayment) {
                if (callback) {
                    callback({
                        text: "⚠️ Transaction validation required before task routing.\\n\\nPlease provide a valid Sepolia testnet transaction hash to proceed.",
                        content: {
                            success: false,
                            error: "Transaction validation required"
                        }
                    });
                }
                return;
            }

            // Simple task routing based on keywords (without LLM for now)
            const taskText = (message.content.text ?? '').toLowerCase();
            let agents: AgentType[] = [];
            let reasoning = "";
            let complexity: 'low' | 'medium' | 'high' = 'medium';

            // Keyword-based routing
            if (taskText.includes('research') || taskText.includes('find') || taskText.includes('search')) {
                agents.push('research');
                reasoning = "Task requires information gathering and research";
            }
            if (taskText.includes('code') || taskText.includes('program') || taskText.includes('debug')) {
                agents.push('coding');
                reasoning = "Task involves coding or software development";
            }
            if (taskText.includes('blockchain') || taskText.includes('web3') || taskText.includes('eth') || taskText.includes('smart contract')) {
                agents.push('blockchain');
                reasoning = "Task relates to blockchain or Web3 technology";
            }
            if (taskText.includes('data') || taskText.includes('analyze') || taskText.includes('visualize')) {
                agents.push('data');
                reasoning = "Task requires data analysis or visualization";
            }

            // Default to research if no specific match
            if (agents.length === 0) {
                agents = ['research'];
                reasoning = "General task routed to research agent";
            }

            const routing: TaskRouting = {
                agents,
                reasoning,
                estimatedComplexity: complexity
            };

            elizaLogger.log("Task routing:", JSON.stringify(routing));

            // Generate response
            const agentNames = agents.map((a: AgentType) => {
                const names: Record<AgentType, string> = {
                    research: 'Research Agent',
                    coding: 'Coding Agent',
                    blockchain: 'Blockchain Agent',
                    data: 'Data Agent'
                };
                return names[a];
            }).join(' + ');

            const complexityEmoji: Record<string, string> = {
                low: '🟢',
                medium: '🟡',
                high: '🔴'
            };

            if (callback) {
                const transactionValue = (state.transactionValidation as any)?.value || '0';
                callback({
                    text: `📋 **Task Routing Analysis**\\n\\n**Assigned Agent(s):** ${agentNames}\\n\\n**Reasoning:** ${reasoning}\\n\\n**Complexity:** ${complexityEmoji[complexity]} ${complexity.toUpperCase()}\\n\\n**Transaction Validated:** ✅ ${transactionValue} ETH\\n\\n---\\n\\nYour task is now being processed by the specialized agent(s). You'll receive the results shortly.`,
                    content: {
                        success: true,
                        routing,
                        transaction: state.transactionValidation
                    }
                });
            }

            // Store routing decision in state
            (state as any).taskRouting = routing;

        } catch (error) {
            elizaLogger.error("Task routing error:", error);

            if (callback) {
                callback({
                    text: `Error routing task: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    content: {
                        success: false,
                        error: error instanceof Error ? error.message : 'Unknown error'
                    }
                });
            }
        }
    },

    examples: [
        [
            {
                name: "{{user1}}",
                content: {
                    text: "Research the latest AI trends and create a technical report"
                }
            },
            {
                name: "{{agent}}",
                content: {
                    text: "I'll route this to the Research Agent and Coding Agent for comprehensive analysis and report generation.",
                    action: "ROUTE_TASK"
                }
            }
        ]
    ]
};
