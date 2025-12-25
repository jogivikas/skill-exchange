# SkillSwap Setup Guide

## Quick Start

### 1. Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
cd ..
```

### 3. Configure Backend
```bash
cd backend
cp .env.example .env
# Edit .env and set your JWT_SECRET
cd ..
```

### 4. Run the Application

**Option A: Run in separate terminals**

Terminal 1 (Frontend):
```bash
cd frontend
npm run dev
```

Terminal 2 (Backend):
```bash
cd backend
npm run dev
```

**Option B: Use npm scripts (if you have concurrently installed)**

You can install `concurrently` globally:
```bash
npm install -g concurrently
```

Then create a script in root `package.json`:
```json
"scripts": {
  "dev:all": "concurrently \"cd frontend && npm run dev\" \"cd backend && npm run dev\""
}
```

### 5. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## First Time Setup

1. **Register a new account** at http://localhost:5173/register
2. **Login** and complete your profile
3. **Add skills** you have and skills you want to learn
4. **Find matches** and send exchange requests
5. **Start messaging** with your matches

## Creating an Admin User

To create an admin user, you can either:

1. Manually edit `backend/database/data/users.json` and set `"isAdmin": true` for a user
2. Or modify the registration route to allow admin creation (not recommended for production)

## Troubleshooting

### Port Already in Use
If port 5000 is already in use, change it in `backend/.env`:
```
PORT=5001
```

### CORS Issues
The backend is configured to allow requests from `http://localhost:5173`. If you change the frontend port, update CORS settings in `backend/server.js`.

### Database Files Not Created
The database files are created automatically on first server start. If they don't exist, make sure the `backend/database/data/` directory has write permissions.

## Production Deployment

### Frontend
1. Build the frontend: `npm run build`
2. Serve the `dist` folder with a web server (nginx, Apache, etc.)
3. Update `VITE_API_URL` in `.env` to point to your production API

### Backend
1. Set `NODE_ENV=production` in `backend/.env`
2. Use a process manager like PM2: `cd backend && pm2 start server.js`
3. Consider replacing JSON file storage with a real database (MongoDB, PostgreSQL)
4. Use environment variables for sensitive data
5. Enable HTTPS

## Next Steps

- Replace JSON storage with a real database
- Add email verification
- Implement real-time messaging with WebSockets
- Add file upload for profile pictures
- Implement rating and review system
- Add search and filtering for matches

