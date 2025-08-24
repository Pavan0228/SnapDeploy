# Quick Start Guide 🚀

This guide will help you get SnapDeploy running locally in under 10 minutes.

## Prerequisites Checklist ✅

- [ ] Node.js 18+ installed
- [ ] MongoDB installed and running
- [ ] AWS account with basic access
- [ ] GitHub account for OAuth app

## Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/Pavan0228/SnapDeploy.git
cd SnapDeploy

# Install all dependencies
npm run install:all
```

Or install manually:
```bash
# Install API Server dependencies
cd api-server && npm install && cd ..

# Install Frontend dependencies  
cd frontend && npm install && cd ..

# Install Build Server dependencies
cd build_server && npm install && cd ..

# Install Reverse Proxy dependencies
cd s3-reverse-proxy && npm install && cd ..
```

## Step 2: Environment Setup

### API Server (.env)
```bash
cd api-server
cp .env.example .env
```

Edit `api-server/.env`:
```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/snapdeploy
JWT_SECRET=your-super-secret-jwt-key-here
ACCESS_TOKEN_SECRET=your-access-token-secret-here
REFRESH_TOKEN_SECRET=your-refresh-token-secret-here

# GitHub OAuth (create at https://github.com/settings/developers)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# AWS (optional for local dev)
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
ECS_CLUSTER_NAME=snapdeploy-cluster
ECS_TASK_DEFINITION=snapdeploy-builder

# Encryption
ENCRYPTION_KEY=12345678901234567890123456789012
```

### Frontend (.env)
```bash
cd ../frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_REVERSE_PROXY_URL=localhost:3001
```

## Step 3: GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: SnapDeploy Local
   - **Homepage URL**: `http://localhost:5173`
   - **Authorization callback URL**: `http://localhost:8000/auth/github/callback`
4. Copy Client ID and Client Secret to your `.env` file

## Step 4: Start Services

### Terminal 1 - API Server
```bash
cd api-server
npm run dev
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

### Terminal 3 - Reverse Proxy (Optional)
```bash
cd s3-reverse-proxy
npm start
```

## Step 5: Access the Application

1. Open your browser to `http://localhost:5173`
2. Create an account or login
3. Connect your GitHub account
4. Create your first project!

## Troubleshooting 🔧

### MongoDB Connection Issues
```bash
# Start MongoDB (macOS with Homebrew)
brew services start mongodb-community

# Start MongoDB (Ubuntu/Debian)
sudo systemctl start mongod

# Start MongoDB (Windows)
net start MongoDB
```

### Port Conflicts
If ports 8000 or 5173 are in use, update the ports in:
- `api-server/.env` (PORT variable)
- `frontend/vite.config.js` (server.port)

### GitHub OAuth Issues
- Ensure callback URL matches exactly: `http://localhost:8000/auth/github/callback`
- Check Client ID and Secret are correct
- Make sure GitHub app is not suspended

### Missing Dependencies
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Development Tips 💡

### Database Reset
```bash
# Connect to MongoDB shell
mongosh

# Switch to snapdeploy database
use snapdeploy

# Drop all collections
db.dropDatabase()
```

### API Testing
Use the built-in REST endpoints:
- GET `http://localhost:8000/health` - Check API health
- POST `http://localhost:8000/auth/register` - Create account
- GET `http://localhost:8000/projects` - List projects (auth required)

### Hot Reloading
Both frontend and backend support hot reloading:
- Frontend: Vite automatically reloads on file changes
- Backend: Nodemon restarts server on file changes

## What's Next? 🎯

Once you have SnapDeploy running locally:

1. **Create a test project** - Use any public GitHub repository
2. **Explore the code** - Check out the `controllers/` and `models/` directories
3. **Make changes** - The codebase is well-structured and documented
4. **Deploy to production** - Follow the deployment guide in the main README

## Need Help? 🆘

- Check the main [README.md](./README.md) for detailed documentation
- Review the [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
- Create an issue on GitHub if you encounter problems
- The code is well-commented - explore the source files!

---

**Happy coding! 🎉**