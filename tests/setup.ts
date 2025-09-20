import { beforeEach, afterEach, vi } from 'vitest';

// Set up environment variables before any imports
process.env.COSMOS_ENDPOINT = 'https://test-cosmos.documents.azure.com:443/';
process.env.COSMOS_KEY = 'test-key';
process.env.COSMOS_DATABASE_NAME = 'test-flixsync';
process.env.COSMOS_CONTAINER_NAME = 'test-users';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-purposes-only';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-testing-purposes-only';

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// Mock the Azure Cosmos DB client
vi.mock('@azure/cosmos', () => ({
  CosmosClient: vi.fn().mockImplementation(() => ({
    databases: {
      createIfNotExists: vi.fn().mockResolvedValue({
        database: { id: 'test-database' }
      })
    }
  }))
}));

vi.mock('../src/config', () => ({
  config: {
    port: 3001,
    database: {
      endpoint: 'https://test-cosmos.documents.azure.com:443/',
      key: 'test-key',
      databaseId: 'test-flixsync',
      containerId: 'test-users'
    },
    jwt: {
      secret: 'test-jwt-secret-key-for-testing-purposes-only',
      refreshSecret: 'test-refresh-secret-key-for-testing-purposes-only',
      expiresIn: '15m',
      refreshExpiresIn: '7d'
    },
    cors: {
      allowedOrigins: ['http://localhost:3000']
    }
  }
}));