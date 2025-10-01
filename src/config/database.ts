import { CosmosClient, Database, Container } from '@azure/cosmos';

class DatabaseConnection {
  private static instance: DatabaseConnection | null = null;
  private client: CosmosClient;
  private database!: Database;
  private container!: Container;
  private isInitialized = false;

  private constructor() {
    this.client = new CosmosClient({
      endpoint: process.env.COSMOS_ENDPOINT!,
      key: process.env.COSMOS_KEY!,
    });
  }

  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Connect to existing database (no provisioning)
      this.database = this.client.database(process.env.COSMOS_DATABASE_NAME!);

      // Connect to existing container (no provisioning)
      this.container = this.database.container(process.env.COSMOS_CONTAINER_NAME!);

      // Verify the connection by checking if the container exists
      await this.container.read();

      this.isInitialized = true;
      console.log('Database connection initialized successfully');
    } catch (error) {
      console.error('Failed to connect to database. Ensure the database and container exist:', error);
      throw new Error(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

export const getDbConnection = () => DatabaseConnection.getInstance();