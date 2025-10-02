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

// This file serves as the entry point for Azure Functions
// The imports above ensure all functions are registered with the runtime
