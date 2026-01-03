import { ethers } from 'ethers';

export interface TransactionValidation {
    isValid: boolean;
    transactionHash: string;
    from: string;
    to: string;
    value: string;
    blockNumber?: number;
    timestamp?: number;
    error?: string;
}

export class Web3Service {
    private provider: ethers.JsonRpcProvider;
    private readonly REQUIRED_CONFIRMATIONS = 1;
    private readonly PAYMENT_ADDRESS: string;

    constructor() {
        const rpcUrl = process.env.SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/YOUR-PROJECT-ID';
        this.provider = new ethers.JsonRpcProvider(rpcUrl);
        this.PAYMENT_ADDRESS = process.env.PAYMENT_ADDRESS || '';
    }

    /**
     * Validate a transaction on Ethereum Sepolia testnet
     */
    async validateTransaction(txHash: string): Promise<TransactionValidation> {
        try {
            // Get transaction receipt
            const receipt = await this.provider.getTransactionReceipt(txHash);

            if (!receipt) {
                return {
                    isValid: false,
                    transactionHash: txHash,
                    from: '',
                    to: '',
                    value: '0',
                    error: 'Transaction not found or not yet mined'
                };
            }

            // Get transaction details
            const tx = await this.provider.getTransaction(txHash);

            if (!tx) {
                return {
                    isValid: false,
                    transactionHash: txHash,
                    from: '',
                    to: '',
                    value: '0',
                    error: 'Transaction details not found'
                };
            }

            // Validate transaction status
            if (receipt.status !== 1) {
                return {
                    isValid: false,
                    transactionHash: txHash,
                    from: tx.from,
                    to: tx.to || '',
                    value: ethers.formatEther(tx.value),
                    error: 'Transaction failed'
                };
            }

            // Validate payment address (if configured)
            if (this.PAYMENT_ADDRESS && tx.to?.toLowerCase() !== this.PAYMENT_ADDRESS.toLowerCase()) {
                return {
                    isValid: false,
                    transactionHash: txHash,
                    from: tx.from,
                    to: tx.to || '',
                    value: ethers.formatEther(tx.value),
                    error: `Payment must be sent to ${this.PAYMENT_ADDRESS}`
                };
            }

            // Get block timestamp
            const block = await this.provider.getBlock(receipt.blockNumber);

            return {
                isValid: true,
                transactionHash: txHash,
                from: tx.from,
                to: tx.to || '',
                value: ethers.formatEther(tx.value),
                blockNumber: receipt.blockNumber,
                timestamp: block?.timestamp
            };

        } catch (error) {
            console.error('Transaction validation error:', error);
            return {
                isValid: false,
                transactionHash: txHash,
                from: '',
                to: '',
                value: '0',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Get ETH balance for an address
     */
    async getBalance(address: string): Promise<string> {
        try {
            const balance = await this.provider.getBalance(address);
            return ethers.formatEther(balance);
        } catch (error) {
            console.error('Error getting balance:', error);
            throw error;
        }
    }

    /**
     * Estimate gas for a transaction
     */
    async estimateGas(tx: ethers.TransactionRequest): Promise<bigint> {
        try {
            return await this.provider.estimateGas(tx);
        } catch (error) {
            console.error('Error estimating gas:', error);
            throw error;
        }
    }

    /**
     * Get current gas price
     */
    async getGasPrice(): Promise<string> {
        try {
            const feeData = await this.provider.getFeeData();
            return ethers.formatUnits(feeData.gasPrice || 0n, 'gwei');
        } catch (error) {
            console.error('Error getting gas price:', error);
            throw error;
        }
    }

    /**
     * Check if an address is valid
     */
    isValidAddress(address: string): boolean {
        return ethers.isAddress(address);
    }

    /**
     * Get transaction count (nonce) for an address
     */
    async getTransactionCount(address: string): Promise<number> {
        try {
            return await this.provider.getTransactionCount(address);
        } catch (error) {
            console.error('Error getting transaction count:', error);
            throw error;
        }
    }
}

// Singleton instance
export const web3Service = new Web3Service();
