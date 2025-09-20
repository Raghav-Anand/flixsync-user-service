import { CosmosClient, Database, Container } from '@azure/cosmos';

class DatabaseConnection {
  private client: CosmosClient;
  private database!: Database;
  private container!: Container;

  constructor() {
    this.client = new CosmosClient({
      endpoint: process.env.COSMOS_ENDPOINT!,
      key: process.env.COSMOS_KEY!,
    });
  }

  async initialize(): Promise<void> {
    try {
      const { database } = await this.client.databases.createIfNotExists({
        id: process.env.COSMOS_DATABASE_NAME!,
      });
      this.database = database;

      const { container } = await this.database.containers.createIfNotExists({
        id: process.env.COSMOS_CONTAINER_NAME!,
        partitionKey: { paths: ['/id'] },
      });
      this.container = container;

      console.log('Database connection initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database connection:', error);
      throw error;
    }
  }

  getContainer(): Container {
    if (!this.container) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.container;
  }

  getDatabase(): Database {
    if (!this.database) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.database;
  }
}

export const dbConnection = new DatabaseConnection();