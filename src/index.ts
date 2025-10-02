import { app } from '@azure/functions';

// Import all functions to register them with Azure Functions runtime
import './functions/health';
import './functions/register';
import './functions/login';
import './functions/refreshToken';
import './functions/logout';
import './functions/getProfile';
import './functions/updateProfile';
import './functions/deleteProfile';
import './functions/getUserById';

// Export app for Azure Functions runtime
export default app;
