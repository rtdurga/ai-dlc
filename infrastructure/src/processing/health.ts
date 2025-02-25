import * as http from 'http';
import { logger } from './logger';

// Create health check server
const server = http.createServer((req, res) => {
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString()
    }));
  } else {
    res.writeHead(404);
    res.end();
  }
});

export function startHealthServer(port: number = 8080): void {
  server.listen(port, () => {
    logger.info(`Health check server listening on port ${port}`);
  });

  server.on('error', (error) => {
    logger.error('Health check server error:', error);
  });
}

// Graceful shutdown
export function stopHealthServer(): Promise<void> {
  return new Promise((resolve) => {
    server.close(() => {
      logger.info('Health check server stopped');
      resolve();
    });
  });
}
