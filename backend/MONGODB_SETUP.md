# MongoDB Setup Guide

## Option 1: Local MongoDB Installation

1. **Install MongoDB Community Edition**
   - Windows: Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - macOS: `brew install mongodb-community`
   - Linux: Follow [MongoDB Installation Guide](https://docs.mongodb.com/manual/installation/)

2. **Start MongoDB**
   - Windows: MongoDB should start as a service automatically
   - macOS/Linux: `mongod --dbpath ~/data/db`

3. **Update .env file**
   ```
   MONGODB_URI=mongodb://localhost:27017/skillswap
   ```

## Option 2: MongoDB Atlas (Cloud - Recommended for Production)

1. **Create a free account** at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

2. **Create a new cluster** (Free tier: M0)

3. **Create a database user**
   - Go to Database Access
   - Add New Database User
   - Choose Password authentication
   - Save the username and password

4. **Whitelist your IP address**
   - Go to Network Access
   - Add IP Address
   - For development, you can add `0.0.0.0/0` (allows all IPs - not recommended for production)

5. **Get connection string**
   - Go to Clusters
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `skillswap` or your preferred database name

6. **Update .env file**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/skillswap?retryWrites=true&w=majority
   ```

## Option 3: Docker (Quick Setup)

1. **Run MongoDB in Docker**
   ```bash
   docker run -d -p 27017:27017 --name mongodb mongo
   ```

2. **Update .env file**
   ```
   MONGODB_URI=mongodb://localhost:27017/skillswap
   ```

## Verify Connection

After setting up MongoDB and updating your `.env` file, start the backend server:

```bash
cd backend
npm run dev
```

You should see: `MongoDB Connected: ...` in the console.

## Troubleshooting

### Connection Refused
- Make sure MongoDB is running
- Check if the port (27017) is correct
- Verify your connection string in `.env`

### Authentication Failed (Atlas)
- Double-check your username and password
- Make sure your IP is whitelisted
- Verify the connection string format

### Database Not Found
- MongoDB will create the database automatically on first write
- No need to create it manually

