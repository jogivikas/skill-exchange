# Fix Port 5000 Already in Use Error

## Quick Fix Options

### Option 1: Change the Port (Recommended)

1. Create or edit `.env` file in the `backend` folder:
   ```
   PORT=5001
   MONGODB_URI=mongodb://localhost:27017/skillswap
   JWT_SECRET=your-secret-key-change-this-in-production
   NODE_ENV=development
   ```

2. Update frontend `.env` file to match:
   ```
   VITE_API_URL=http://localhost:5001/api
   ```

3. Restart the backend server

### Option 2: Kill the Process Using Port 5000

**Windows (PowerShell):**
```powershell
# Find the process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with the actual process ID)
taskkill /PID <PID> /F
```

**Windows (Command Prompt):**
```cmd
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**macOS/Linux:**
```bash
# Find the process
lsof -ti:5000

# Kill the process
kill -9 $(lsof -ti:5000)
```

### Option 3: Use a Different Port Temporarily

Just change the PORT in `.env` to any available port (e.g., 5001, 3001, 8000)

## Verify Port is Free

**Windows:**
```powershell
netstat -ano | findstr :5000
```

If nothing shows up, the port is free.

**macOS/Linux:**
```bash
lsof -i:5000
```

If nothing shows up, the port is free.

