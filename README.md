# FlixSync User Service

User authentication and profile management service for the FlixSync movie recommendation platform.

## Features

- User registration and authentication
- JWT token management (access + refresh tokens)
- User profile management
- Password hashing with bcrypt
- Azure Cosmos DB integration
- Input validation with Joi
- TypeScript support
- Express.js REST API

## API Documentation

### Base URL
```
http://localhost:3001/api/v1
```

### Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

---

## API Endpoints

### Authentication

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "securePassword123",
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "favoriteGenres": ["Action", "Comedy"],
    "bio": "Movie enthusiast"
  },
  "preferences": {
    "language": "en",
    "region": "US",
    "adultContent": false,
    "notifications": {
      "newRecommendations": true,
      "groupInvites": true,
      "movieUpdates": false,
      "email": true,
      "push": false
    },
    "privacy": {
      "profileVisibility": "public",
      "ratingsVisibility": "friends",
      "allowGroupInvites": true
    }
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-123",
      "email": "user@example.com",
      "username": "johndoe",
      "profile": {
        "firstName": "John",
        "lastName": "Doe",
        "favoriteGenres": ["Action", "Comedy"],
        "bio": "Movie enthusiast"
      },
      "preferences": {
        "language": "en",
        "region": "US",
        "adultContent": false,
        "notifications": {
          "newRecommendations": true,
          "groupInvites": true,
          "movieUpdates": false,
          "email": true,
          "push": false
        },
        "privacy": {
          "profileVisibility": "public",
          "ratingsVisibility": "friends",
          "allowGroupInvites": true
        }
      },
      "streamingSubscriptions": [],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Validation Rules:**
- `email`: Valid email format, required
- `username`: 3-30 alphanumeric characters, required
- `password`: Minimum 8 characters, required
- `profile.firstName/lastName`: Maximum 50 characters
- `profile.favoriteGenres`: Array of strings
- `profile.bio`: Maximum 500 characters
- `preferences.language/region`: 2-character codes
- `preferences.privacy.profileVisibility`: "public", "friends", or "private"

---

#### POST /auth/login
Authenticate a user and receive tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-123",
      "email": "user@example.com",
      "username": "johndoe",
      "profile": { "..." },
      "preferences": { "..." },
      "streamingSubscriptions": [],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

---

#### POST /auth/refresh
Refresh an expired access token using a refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": { "..." },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### POST /auth/logout
Logout user (client-side token invalidation).

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### User Management

#### GET /users/profile
Get the current authenticated user's profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "email": "user@example.com",
    "username": "johndoe",
    "profile": {
      "firstName": "John",
      "lastName": "Doe",
      "avatar": "https://example.com/avatar.jpg",
      "dateOfBirth": "1990-01-01T00:00:00.000Z",
      "favoriteGenres": ["Action", "Comedy"],
      "bio": "Movie enthusiast"
    },
    "preferences": {
      "language": "en",
      "region": "US",
      "adultContent": false,
      "notifications": {
        "newRecommendations": true,
        "groupInvites": true,
        "movieUpdates": false,
        "email": true,
        "push": false
      },
      "privacy": {
        "profileVisibility": "public",
        "ratingsVisibility": "friends",
        "allowGroupInvites": true
      }
    },
    "streamingSubscriptions": [
      {
        "serviceId": "netflix",
        "serviceName": "Netflix",
        "isActive": true,
        "tier": "Premium",
        "addedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

#### PUT /users/profile
Update the current authenticated user's profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "profile": {
    "firstName": "Jane",
    "lastName": "Smith",
    "avatar": "https://example.com/new-avatar.jpg",
    "favoriteGenres": ["Drama", "Thriller"],
    "bio": "Updated bio"
  },
  "preferences": {
    "language": "es",
    "region": "ES",
    "adultContent": true,
    "notifications": {
      "newRecommendations": false,
      "email": false
    },
    "privacy": {
      "profileVisibility": "private"
    }
  },
  "streamingSubscriptions": [
    {
      "serviceId": "amazon-prime",
      "serviceName": "Amazon Prime Video",
      "isActive": true,
      "tier": "Premium",
      "addedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "email": "user@example.com",
    "username": "johndoe",
    "profile": {
      "firstName": "Jane",
      "lastName": "Smith",
      "avatar": "https://example.com/new-avatar.jpg",
      "favoriteGenres": ["Drama", "Thriller"],
      "bio": "Updated bio"
    },
    "preferences": { "..." },
    "streamingSubscriptions": [ "..." ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:30:00.000Z"
  }
}
```

---

#### DELETE /users/profile
Delete the current authenticated user's account.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User account deleted successfully"
}
```

---

#### GET /users/:userId
Get public information about a specific user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `userId` (string): The ID of the user to retrieve

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "user-456",
    "username": "anotherdoe",
    "profile": {
      "firstName": "Another",
      "lastName": "User",
      "avatar": "https://example.com/avatar2.jpg",
      "favoriteGenres": ["Sci-Fi", "Action"]
    },
    "preferences": {
      "language": "en",
      "region": "US",
      "privacy": {
        "profileVisibility": "public"
      }
    },
    "streamingSubscriptions": [],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Note:** Email and sensitive information are excluded from public user data.

---

### Health Check

#### GET /health
Check if the service is running and healthy.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User service is healthy",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

## Error Responses

### 400 Bad Request - Validation Error
```json
{
  "error": "Validation failed",
  "details": [
    "\"email\" must be a valid email",
    "\"password\" length must be at least 8 characters long"
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Access token required"
}
```

```json
{
  "error": "Invalid or expired token"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Data Models

### User Profile
```typescript
interface UserProfile {
  firstName?: string;        // Max 50 characters
  lastName?: string;         // Max 50 characters
  avatar?: string;           // Valid URI
  dateOfBirth?: Date;
  favoriteGenres: string[];  // Array of genre names
  bio?: string;              // Max 500 characters
}
```

### User Preferences
```typescript
interface UserPreferences {
  language: string;          // 2-character language code (e.g., "en")
  region: string;            // 2-character region code (e.g., "US")
  adultContent: boolean;
  notifications: {
    newRecommendations: boolean;
    groupInvites: boolean;
    movieUpdates: boolean;
    email: boolean;
    push: boolean;
  };
  privacy: {
    profileVisibility: "public" | "friends" | "private";
    ratingsVisibility: "public" | "friends" | "private";
    allowGroupInvites: boolean;
  };
}
```

### Streaming Subscription
```typescript
interface StreamingSubscription {
  serviceId: string;      // Unique service identifier
  serviceName: string;    // Display name (e.g., "Netflix")
  isActive: boolean;      // Whether subscription is currently active
  tier?: string;          // Subscription tier (e.g., "Premium", "Basic")
  addedAt: Date;          // When subscription was added to profile
}
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
PORT=3001
NODE_ENV=development

# Azure Cosmos DB
COSMOS_ENDPOINT=your_cosmos_endpoint
COSMOS_KEY=your_cosmos_key
COSMOS_DATABASE_NAME=flixsync
COSMOS_CONTAINER_NAME=users

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your_jwt_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Production

```bash
npm start
```

## Testing

```bash
npm test
```

## Architecture

The service follows a layered architecture:

- **Controllers**: Handle HTTP requests and responses
- **Services**: Business logic layer
- **Models**: Data models and validation
- **Middleware**: Authentication, validation, error handling
- **Routes**: API route definitions
- **Config**: Configuration and database connection

## Dependencies

- Express.js - Web framework
- Azure Cosmos DB - Database
- JWT - Authentication tokens
- bcryptjs - Password hashing
- Joi - Input validation
- Helmet - Security headers
- CORS - Cross-origin resource sharing