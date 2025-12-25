# SkillSwap - Exchange Skills, Not Money

A modern full-stack web application for skill exchange where users can teach what they know and learn what they need.

## Features

### Frontend
- **Landing Page**: Beautiful hero section with "How It Works" and statistics
- **User Authentication**: Registration and login pages
- **Profile Management**: Users can manage their profile and add/remove skills they have and want to learn
- **Find Matches**: Discover users whose skills align with your learning goals
- **Exchange Requests**: Manage incoming and outgoing skill exchange requests
- **Messages**: Real-time messaging interface for communication
- **Admin Dashboard**: Comprehensive admin panel with user management and metrics

### Backend
- RESTful API with Express.js
- JWT-based authentication
- User management and profile system
- Match finding algorithm
- Exchange request system
- Messaging system
- Admin endpoints

## Tech Stack

### Frontend
- **React 18** - UI library
- **React Router** - Routing
- **Vite** - Build tool and dev server
- **CSS3** - Styling

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **JSON File Storage** - Simple database (can be replaced with MongoDB/PostgreSQL)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional):
```bash
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up MongoDB (choose one):
   - **Local MongoDB**: Install MongoDB locally and start it
   - **MongoDB Atlas**: Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - **Docker**: `docker run -d -p 27017:27017 --name mongodb mongo`
   - See `backend/MONGODB_SETUP.md` for detailed instructions

4. Create a `.env` file:
```bash
cp .env.example .env
```

5. Update `.env` with your configuration:
```
PORT=5000
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/skillswap
```
   - For MongoDB Atlas, use: `MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/skillswap`

6. Start the server:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

**Note**: If you get a "port already in use" error, see `backend/FIX_PORT.md` for solutions.

### Running Both

Open two terminal windows:
1. Terminal 1: Run the frontend (`cd frontend && npm run dev`)
2. Terminal 2: Run the backend (`cd backend && npm run dev`)

## Project Structure

```
skill-swap/
├── frontend/               # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service layer
│   │   ├── context/       # React context (Auth)
│   │   └── ...
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── backend/                # Backend Express API
│   ├── routes/            # API routes
│   ├── middleware/        # Express middleware
│   ├── database/          # Database layer (JSON files)
│   ├── server.js
│   └── package.json
├── README.md
└── SETUP.md
```

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

Most endpoints require authentication. The frontend automatically includes the JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Database

The backend uses **MongoDB** for data storage. You need to set up MongoDB before running the backend.

### MongoDB Setup Options:
1. **Local MongoDB** - Install MongoDB on your machine
2. **MongoDB Atlas** - Free cloud MongoDB (recommended)
3. **Docker** - Run MongoDB in a container

See `backend/MONGODB_SETUP.md` for detailed setup instructions.

### Database Collections:
- `users` - User data and profiles
- `requests` - Exchange requests
- `messages` - Messages between users

## Environment Variables

### Frontend (.env)
- `VITE_API_URL` - Backend API URL (default: http://localhost:5000/api)

### Backend (.env)
- `PORT` - Server port (default: 5000)
- `JWT_SECRET` - Secret key for JWT tokens
- `NODE_ENV` - Environment (development/production)
- `MONGODB_URI` - MongoDB connection string (required)

## Build for Production

### Frontend
```bash
npm run build
```

The built files will be in the `dist` directory.

### Backend
```bash
npm start
```

## Design

The application features a modern, clean design with:
- Purple (#7c3aed) as the primary brand color
- Responsive layout
- Card-based UI components
- Smooth transitions and hover effects

## License

MIT
