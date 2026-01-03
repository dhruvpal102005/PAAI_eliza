import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { elizaLogger } from '@elizaos/core';
import { web3Service } from '../services/web3Service';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
    elizaLogger.log(`${req.method} ${req.path}`);
    next();
});

// Types
interface TaskSubmission {
    task: string;
    walletAddress: string;
    transactionHash: string;
}

interface TaskStatus {
    id: string;
    task: string;
    status: 'pending' | 'validating' | 'processing' | 'completed' | 'failed';
    transactionHash: string;
    assignedAgents?: string[];
    result?: any;
    error?: string;
    createdAt: number;
    updatedAt: number;
}

// In-memory storage (replace with database in production)
const tasks = new Map<string, TaskStatus>();

/**
 * Health check endpoint
 */
app.get('/api/health', (req: Request, res: Response) => {
    res.json({
        status: 'healthy',
        timestamp: Date.now(),
        service: 'BlockAI Platform API'
    });
});

/**
 * Submit a new task with Web3 transaction
 */
app.post('/api/task', async (req: Request, res: Response) => {
    try {
        const { task, walletAddress, transactionHash }: TaskSubmission = req.body;

        // Validate input
        if (!task || !walletAddress || !transactionHash) {
            return res.status(400).json({
                error: 'Missing required fields: task, walletAddress, transactionHash'
            });
        }

        // Validate wallet address
        if (!web3Service.isValidAddress(walletAddress)) {
            return res.status(400).json({
                error: 'Invalid wallet address'
            });
        }

        // Create task record
        const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const taskRecord: TaskStatus = {
            id: taskId,
            task,
            status: 'validating',
            transactionHash,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        tasks.set(taskId, taskRecord);

        // Validate transaction asynchronously
        validateAndProcessTask(taskId, transactionHash, task).catch(error => {
            elizaLogger.error(`Task ${taskId} processing error:`, error);
            const task = tasks.get(taskId);
            if (task) {
                task.status = 'failed';
                task.error = error.message;
                task.updatedAt = Date.now();
            }
        });

        res.status(202).json({
            success: true,
            taskId,
            message: 'Task submitted. Validating transaction...',
            status: taskRecord.status
        });

    } catch (error) {
        elizaLogger.error('Task submission error:', error);
        res.status(500).json({
            error: 'Failed to submit task',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * Get task status
 */
app.get('/api/task/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const task = tasks.get(id);

    if (!task) {
        return res.status(404).json({
            error: 'Task not found'
        });
    }

    res.json({
        success: true,
        task
    });
});

/**
 * List all tasks (with pagination)
 */
app.get('/api/tasks', (req: Request, res: Response) => {
    const { limit = '10', offset = '0' } = req.query;
    const limitNum = parseInt(limit as string);
    const offsetNum = parseInt(offset as string);

    const allTasks = Array.from(tasks.values())
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(offsetNum, offsetNum + limitNum);

    res.json({
        success: true,
        tasks: allTasks,
        total: tasks.size,
        limit: limitNum,
        offset: offsetNum
    });
});

/**
 * Validate transaction endpoint
 */
app.post('/api/validate', async (req: Request, res: Response) => {
    try {
        const { transactionHash } = req.body;

        if (!transactionHash) {
            return res.status(400).json({
                error: 'Transaction hash is required'
            });
        }

        const validation = await web3Service.validateTransaction(transactionHash);

        res.json({
            success: validation.isValid,
            validation
        });

    } catch (error) {
        elizaLogger.error('Validation error:', error);
        res.status(500).json({
            error: 'Failed to validate transaction',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * Get available agents
 */
app.get('/api/agents', (req: Request, res: Response) => {
    res.json({
        success: true,
        agents: [
            {
                name: 'Orchestrator',
                type: 'orchestrator',
                description: 'Master coordinator that routes tasks to specialized agents',
                capabilities: ['task_routing', 'transaction_validation', 'multi_agent_coordination']
            },
            {
                name: 'Research Agent',
                type: 'research',
                description: 'Information gathering and analysis specialist',
                capabilities: ['web_search', 'data_synthesis', 'fact_checking', 'report_generation']
            },
            {
                name: 'Coding Agent',
                type: 'coding',
                description: 'Software development and code generation specialist',
                capabilities: ['code_generation', 'debugging', 'code_review', 'refactoring']
            },
            {
                name: 'Blockchain Agent',
                type: 'blockchain',
                description: 'Web3 and blockchain technology specialist',
                capabilities: ['smart_contracts', 'web3_queries', 'defi_analysis', 'transaction_handling']
            },
            {
                name: 'Data Agent',
                type: 'data',
                description: 'Data analysis and visualization specialist',
                capabilities: ['data_processing', 'statistical_analysis', 'visualization', 'pattern_recognition']
            }
        ]
    });
});

/**
 * Helper function to validate and process task
 */
async function validateAndProcessTask(taskId: string, transactionHash: string, taskDescription: string) {
    const task = tasks.get(taskId);
    if (!task) return;

    try {
        // Validate transaction
        elizaLogger.log(`Validating transaction for task ${taskId}`);
        const validation = await web3Service.validateTransaction(transactionHash);

        if (!validation.isValid) {
            task.status = 'failed';
            task.error = validation.error || 'Transaction validation failed';
            task.updatedAt = Date.now();
            return;
        }

        // Transaction validated, update status
        task.status = 'processing';
        task.updatedAt = Date.now();

        elizaLogger.log(`Transaction validated for task ${taskId}. Processing...`);

        // TODO: Here you would integrate with the ElizaOS runtime to actually process the task
        // For now, we'll simulate processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Simulate task completion
        task.status = 'completed';
        task.assignedAgents = ['orchestrator']; // This would be determined by the routing logic
        task.result = {
            message: 'Task processed successfully (simulation)',
            transactionValue: validation.value,
            processedAt: Date.now()
        };
        task.updatedAt = Date.now();

        elizaLogger.log(`Task ${taskId} completed successfully`);

    } catch (error) {
        elizaLogger.error(`Error processing task ${taskId}:`, error);
        task.status = 'failed';
        task.error = error instanceof Error ? error.message : 'Unknown error';
        task.updatedAt = Date.now();
    }
}

/**
 * Error handling middleware
 */
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    elizaLogger.error('Unhandled error:', err.message);
    res.status(500).json({
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

/**
 * Start server
 */
export function startServer() {
    app.listen(PORT, () => {
        elizaLogger.log(`🚀 BlockAI Platform API server running on port ${PORT}`);
        elizaLogger.log(`📍 Health check: http://localhost:${PORT}/api/health`);
        elizaLogger.log(`📋 API endpoints:`);
        elizaLogger.log(`   POST /api/task - Submit new task`);
        elizaLogger.log(`   GET  /api/task/:id - Get task status`);
        elizaLogger.log(`   GET  /api/tasks - List all tasks`);
        elizaLogger.log(`   POST /api/validate - Validate transaction`);
        elizaLogger.log(`   GET  /api/agents - List available agents`);
    });

    return app;
}

export default app;
