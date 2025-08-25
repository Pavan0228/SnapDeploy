# SnapDeploy - GitHub Copilot Coding Instructions

SnapDeploy is a web platform for deploying static websites from GitHub repositories. It consists of 4 Node.js services: a React frontend, Express.js API server, build server that runs in Docker containers, and a reverse proxy for serving deployed sites.

**ALWAYS reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Working Effectively

### Bootstrap and Build All Components
- Install Node.js 20+ (already available in environment)
- Build and test all services in this order:

**Frontend (React + Vite)**:
```bash
cd frontend
npm install  # Takes ~2 seconds. NEVER CANCEL.
npm run build  # Takes ~4 seconds. NEVER CANCEL.
npm run dev  # Starts dev server in ~200ms on http://localhost:5173
```

**API Server (Express.js)**:
```bash
cd api-server  
npm install  # Takes ~20 seconds. NEVER CANCEL.
# Requires extensive environment configuration - see Environment Setup section
npm run start  # Will fail without proper .env setup
```

**S3 Reverse Proxy**:
```bash
cd s3-reverse-proxy
npm install  # Takes ~1 second. NEVER CANCEL.
# Requires MongoDB and environment setup
```

**Build Server**:
```bash
cd build_server
npm install  # Takes ~3 seconds. NEVER CANCEL.
# Runs in Docker containers via AWS ECS in production
```

### Build Times and Timeouts
- **Frontend install**: 2 seconds - Set timeout to 30+ seconds
- **Frontend build**: 4 seconds - Set timeout to 30+ seconds  
- **API server install**: 20 seconds - Set timeout to 60+ seconds
- **S3 proxy install**: 1 second - Set timeout to 30+ seconds
- **Build server install**: 3 seconds - Set timeout to 30+ seconds
- **NEVER CANCEL** any npm install or build commands. Wait for completion.

## Environment Setup

### Required Services
SnapDeploy requires these external services to run fully:
- **MongoDB** - User data, projects, deployments
- **Kafka** - Real-time build logging and messaging  
- **ClickHouse** - Analytics and log storage
- **AWS S3** - Static site hosting
- **AWS ECS** - Docker container orchestration for builds
- **GitHub OAuth App** - User authentication

### Environment Variables Template
Create `.env` files in each service directory:

**api-server/.env**:
```bash
# Database
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=snapdeploy

# JWT Authentication  
ACCESS_TOKEN_SECRET=your-secret-change-this
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your-refresh-secret-change-this  
REFRESH_TOKEN_EXPIRY=7d

# GitHub OAuth (create app at github.com/settings/applications/new)
GITHUB_CLIENT_ID=your-github-oauth-client-id
GITHUB_CLIENT_SECRET=your-github-oauth-client-secret
GITHUB_REDIRECT_URI=http://localhost:3000/auth/github/callback
GITHUB_TOKEN_ENCRYPTION_KEY=your-encryption-key-32-chars-min

# AWS Services
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_BUCKET_NAME=your-s3-bucket
ECS_CLUSTER_NAME=your-ecs-cluster
ECS_TASK_DEFINITION=your-ecs-task

# Kafka (for real-time build logs)
KAFKA_BROKER=your-kafka-host:9092
KAFKA_USERNAME=your-kafka-user
KAFKA_PASSWORD=your-kafka-password
KAFKA_CERT=your-kafka-certificate-content

# ClickHouse (for analytics)  
CLICKHOUSE_HOST=your-clickhouse-host
CLICKHOUSE_USER=your-clickhouse-user
CLICKHOUSE_PASSWORD=your-clickhouse-password

# Server Config
PORT=9000
CORS_ORIGIN=http://localhost:3000
```

**s3-reverse-proxy/.env**:
```bash
PORT=8000
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=snapdeploy
BASE_URL=https://your-s3-bucket.s3.amazonaws.com/
```

**build_server/.env** (for Docker):
```bash
PROJECT_ID=test-project
DEPLOYMENT_ID=test-deployment  
FRONTEND_PATH=./
GIT_REPOSITORY__URL=https://github.com/example/repo
GITHUB_BRANCH=main
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_BUCKET_NAME=your-s3-bucket
KAFKA_BROKER=your-kafka-host:9092
KAFKA_USERNAME=your-kafka-user
KAFKA_PASSWORD=your-kafka-password
```

## Development Workflow

### Frontend Development
```bash
cd frontend
npm install
npm run dev  # http://localhost:5173
# Edit files in src/ - uses React, Vite, Tailwind CSS
npm run build  # Creates dist/ folder
npm run lint  # Will show errors but build still works
```

### API Development  
```bash
cd api-server
npm install
# Create .env file with required variables
npm run dev  # Uses nodemon, http://localhost:9000
```

### Testing Changes
- **Frontend**: Visit http://localhost:5173 and test the UI manually
- **API**: Test endpoints at http://localhost:9000/api/v1/
- **Integration**: Requires MongoDB + proper environment setup

## Validation

### Always Test After Changes
1. **Build Validation**: Always run `npm run build` in frontend after changes
2. **Lint Check**: Run `npm run lint` in frontend (has errors but build works)
3. **Manual Testing**: Start dev server and test user flows in browser
4. **No Unit Tests**: Repository has no test suites - rely on manual validation

### User Scenarios to Test
- **Homepage Load**: Visit http://localhost:5173 - should show SnapDeploy landing page
- **Authentication Flow**: GitHub OAuth integration (requires GitHub app setup)
- **Project Creation**: Connect GitHub repo and deploy (requires full service stack)
- **Build Process**: Clone repo → npm install → npm run build → upload to S3

## Common Issues and Solutions

### Frontend Issues
- **Lint Errors**: 54+ ESLint errors exist but build succeeds - ignore unless blocking
- **Build Failures**: Usually missing dependencies - run `npm install` first
- **Dev Server**: Starts on port 5173, may conflict with other Vite projects

### API Server Issues  
- **Startup Failures**: Usually missing environment variables - check .env file
- **Kafka Errors**: Requires valid kafka.pem certificate file
- **Database Errors**: Requires MongoDB connection
- **GitHub OAuth**: Requires valid OAuth app credentials

### Build Server Issues
- **Docker Build**: Requires network access, kafka.pem, and .env files
- **Repository Cloning**: Uses different strategies for private vs public repos
- **npm install**: Tries multiple strategies: `--legacy-peer-deps`, `--force`, then standard

### Performance Notes
- **Build Server**: Can handle ERESOLVE dependency conflicts automatically
- **Frontend**: Fast builds (~4s) and hot reload in dev mode
- **Memory**: Docker builds may require 2GB+ memory for large projects

## Architecture Overview

### Component Relationships
1. **Frontend** (React) → **API Server** (Express.js) 
2. **API Server** → **AWS ECS** (triggers builds)
3. **Build Server** (Docker) → **S3** (uploads built sites)
4. **S3 Reverse Proxy** → **S3** (serves sites via subdomains)

### Data Flow
1. User authenticates via GitHub OAuth
2. User connects GitHub repository  
3. API triggers ECS task with build server
4. Build server clones repo, runs `npm install && npm run build`
5. Built files uploaded to S3 with project ID path
6. Reverse proxy routes `subdomain.domain.com` to S3 path

### Key Files
- **frontend/src/App.jsx** - Main React app component
- **api-server/app.js** - Express.js app configuration  
- **api-server/routes/** - API endpoint definitions
- **build_server/script.js** - Main build orchestration logic
- **build_server/main.sh** - Git clone and Docker entry point
- **s3-reverse-proxy/index.js** - Subdomain routing logic

## Production Deployment

### Build Server Container
- Runs in AWS ECS Fargate
- Uses Ubuntu with Node.js 20
- Requires kafka.pem and .env files
- Build command: `docker build -t snapdeploy-build-server .`

### Environment Requirements  
- **Development**: Node.js 20+, npm 10+
- **Production**: AWS ECS, S3, RDS/MongoDB, Kafka, ClickHouse
- **Optional**: Local MongoDB for development

### Scaling Considerations
- Build server containers scale automatically via ECS
- Frontend is static and CDN-ready
- API server connects to external databases and services

Remember: This is a production-ready platform with real AWS integration. Always test thoroughly and never commit secrets to the repository.