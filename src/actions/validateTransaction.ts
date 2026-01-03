import {
    type Action,
    type IAgentRuntime,
    type Memory,
    type State,
    type HandlerCallback,
    ModelClass,
    generateText,
    composeContext,
    elizaLogger
} from "@elizaos/core";
import { web3Service } from "../services/web3Service";

export const validateTransactionAction: Action = {
    name: "VALIDATE_TRANSACTION",
    similes: ["VERIFY_PAYMENT", "CHECK_TRANSACTION", "CONFIRM_PAYMENT"],
    description: "Validates a Web3 transaction before allowing task execution",

    validate: async (runtime: IAgentRuntime, message: Memory, state?: State) => {
        // Check if message contains a transaction hash
        const text = message.content.text.toLowerCase();
        return text.includes('0x') && text.length >= 66; // Ethereum tx hash length
    },

    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        options: any,
        callback?: HandlerCallback
    ) => {
        elizaLogger.log("Validating transaction...");

        try {
            // Extract transaction hash from message
            const txHashMatch = message.content.text.match(/0x[a-fA-F0-9]{64}/);

            if (!txHashMatch) {
                if (callback) {
                    callback({
                        text: "No valid transaction hash found. Please provide a transaction hash starting with 0x.",
                        content: {
                            success: false,
                            error: "Invalid transaction hash format"
                        }
                    });
                }
                return false;
            }

            const txHash = txHashMatch[0];
            elizaLogger.log(`Validating transaction: ${txHash}`);

            // Validate the transaction
            const validation = await web3Service.validateTransaction(txHash);

            if (!validation.isValid) {
                if (callback) {
                    callback({
                        text: `Transaction validation failed: ${validation.error}\n\nPlease ensure:\n- Transaction is confirmed on Sepolia testnet\n- Payment was sent to the correct address\n- Transaction was successful`,
                        content: {
                            success: false,
                            validation
                        }
                    });
                }
                return false;
            }

            // Transaction is valid
            elizaLogger.log(`Transaction validated successfully: ${validation.value} ETH from ${validation.from}`);

            if (callback) {
                callback({
                    text: `✅ Transaction validated successfully!\n\n**Transaction Details:**\n- Hash: ${validation.transactionHash}\n- From: ${validation.from}\n- Amount: ${validation.value} ETH\n- Block: ${validation.blockNumber}\n\nYour task will now be processed.`,
                    content: {
                        success: true,
                        validation
                    }
                });
            }

            // Store validation in state for later use
            if (state) {
                state.transactionValidation = validation;
            }

            return true;

        } catch (error) {
            elizaLogger.error("Transaction validation error:", error);

            if (callback) {
                callback({
                    text: `Error validating transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    content: {
                        success: false,
                        error: error instanceof Error ? error.message : 'Unknown error'
                    }
                });
            }

            return false;
        }
    },

    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "I want to submit a task. Here's my transaction: 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
                }
            },
            {
                user: "{{agent}}",
                content: {
                    text: "Let me validate your transaction...",
                    action: "VALIDATE_TRANSACTION"
                }
            }
        ]
    ]
};
