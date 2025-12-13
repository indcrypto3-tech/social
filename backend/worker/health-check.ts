
import { Worker } from 'bullmq';
import { db } from '../lib/db';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import http from 'http';

dotenv.config();

const CONNECTION = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
};

export async function checkHealth() {
    try {
        // 1. Check DB
        await db.execute(sql`SELECT 1`);

        // 2. Check Redis (via BullMQ or direct)
        // We'll trust if we can connect a worker
        const testWorker = new Worker('health-check', async () => { }, {
            connection: CONNECTION
        });
        await testWorker.close();

        return { status: 'healthy', timestamp: new Date().toISOString() };
    } catch (error: any) {
        return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() };
    }
}

// Simple HTTP server for health checks (e.g., for k8s or uptime monitors)
export function startHealthServer(initialPort = 3001) {
    const tryListen = (port: number) => {
        const server = http.createServer(async (req, res) => {
            if (req.url === '/health') {
                const health = await checkHealth();
                res.writeHead(health.status === 'healthy' ? 200 : 500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(health));
            } else {
                res.writeHead(404);
                res.end();
            }
        });

        server.listen(port, () => {
            console.log(`Health check server running on port ${port}`);
        });

        server.on('error', (e: any) => {
            if (e.code === 'EADDRINUSE') {
                console.log(`Port ${port} in use, trying ${port + 1}...`);
                tryListen(port + 1);
            } else {
                console.error(`Health Server Error on port ${port}:`, e);
            }
        });

        return server;
    };

    return tryListen(initialPort);
}
