import { createApp } from './app';
import { config } from './config';
import { getDbConnection } from './config/database';

const startServer = async (): Promise<void> => {
  try {
    const dbConnection = getDbConnection();
    await dbConnection.initialize();
    console.log('Database connection established');

    const app = await createApp();

    await app.listen({ port: config.port, host: '0.0.0.0' })

    console.log(`User service running on port ${config.port}`);
    console.log(`Environment: ${config.nodeEnv}`);
    console.log(`Health check: http://localhost:${config.port}/api/v1/health`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer();