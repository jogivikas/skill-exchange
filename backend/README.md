# SkillSwap Backend API

RESTful API server for the SkillSwap application.

## Features

- User authentication (JWT-based)
- User profile and skills management
- Match finding algorithm
- Exchange request management
- Messaging system
- Admin dashboard endpoints

## Tech Stack

- **Node.js** - Runtime environment
- **Express** - Web framework
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **JSON File Storage** - Simple database (can be replaced with MongoDB/PostgreSQL)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
```
PORT=5000
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
```

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/profile` - Get user profile (authenticated)
- `PUT /api/users/profile` - Update user profile (authenticated)
- `POST /api/users/skills/have` - Add skill user has (authenticated)
- `DELETE /api/users/skills/have/:skill` - Remove skill user has (authenticated)
- `POST /api/users/skills/want` - Add skill user wants (authenticated)
- `DELETE /api/users/skills/want/:skill` - Remove skill user wants (authenticated)
- `GET /api/users/:id` - Get user by ID (authenticated)

### Matches
- `GET /api/matches` - Find potential matches (authenticated)

### Requests
- `GET /api/requests/incoming` - Get incoming requests (authenticated)
- `GET /api/requests/outgoing` - Get outgoing requests (authenticated)
- `POST /api/requests` - Create exchange request (authenticated)
- `PUT /api/requests/:id/accept` - Accept request (authenticated)
- `PUT /api/requests/:id/reject` - Reject request (authenticated)

### Messages
- `GET /api/messages/conversations` - Get conversations list (authenticated)
- `GET /api/messages/:userId` - Get messages with user (authenticated)
- `POST /api/messages` - Send message (authenticated)

### Admin
- `GET /api/admin/metrics` - Get dashboard metrics (admin only)
- `GET /api/admin/users` - Get all users (admin only)
- `PUT /api/admin/users/:id/status` - Update user status (admin only)

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Database

The backend uses JSON file storage by default. Data is stored in `database/data/`:
- `users.json` - User data
- `requests.json` - Exchange requests
- `messages.json` - Messages

For production, consider replacing with MongoDB, PostgreSQL, or another database.

## Environment Variables

- `PORT` - Server port (default: 5000)
- `JWT_SECRET` - Secret key for JWT tokens
- `NODE_ENV` - Environment (development/production)

