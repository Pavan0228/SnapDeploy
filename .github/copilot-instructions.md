# SnapDeploy

SnapDeploy is a full-stack web deployment platform that enables users to deploy static websites from GitHub repositories to AWS S3. The platform consists of four main components: a React frontend, Express.js API server, build automation service, and S3 reverse proxy.

**ALWAYS follow these instructions first. Only fallback to additional search and context gathering if the information in these instructions is incomplete or found to be in error. These instructions contain validated, working commands with exact timing expectations.**

## Working Effectively

### Prerequisites and Setup
- Node.js 20.19.4+ and npm 10.8.2+ are required
- Install all dependencies for each component:
  ```bash
  cd /home/runner/work/SnapDeploy/SnapDeploy/frontend && npm install
  cd /home/runner/work/SnapDeploy/SnapDeploy/api-server && npm install  
  cd /home/runner/work/SnapDeploy/SnapDeploy/build_server && npm install
  cd /home/runner/work/SnapDeploy/SnapDeploy/s3-reverse-proxy && npm install
  ```
- **NEVER CANCEL**: npm install times: frontend (29s), api-server (29s), build_server (2s), s3-reverse-proxy (1.5s). Set timeout to 60+ seconds.

### Build and Development Commands
- **Frontend (React + Vite)**:
  - `cd frontend && npm run build` -- builds in 3.7 seconds. NEVER CANCEL. Set timeout to 30+ seconds.
  - `cd frontend && npm run dev` -- starts dev server on http://localhost:5173/ in 0.2 seconds
  - `cd frontend && npm run preview` -- serves built files on http://localhost:4173/
  - `cd frontend && npm run lint` -- runs ESLint in 1.2 seconds (expect 45 errors, 9 warnings - build still succeeds)

- **API Server (Express.js)**:
  - `cd api-server && npm run dev` -- starts dev server with nodemon on port 9000
  - `cd api-server && npm start` -- starts production server on port 9000
  - **WARNING**: Requires MongoDB connection (will fail without proper .env setup)
  - **DEPENDENCY ISSUE**: `npm run dev` may fail with "nodemon: not found" - this is expected without global nodemon install

- **Build Server**:
  - `cd build_server && npm run dev` -- runs the build automation script
  - Used internally by Docker containers for deployment builds

- **S3 Reverse Proxy**:
  - `cd s3-reverse-proxy && npm run dev` -- starts proxy server with nodemon
  - `cd s3-reverse-proxy && npm start` -- starts proxy server

### Environment Configuration
**CRITICAL**: The application requires extensive environment configuration. These services need external dependencies:
- **MongoDB**: API server requires `MONGO_URI` and `MONGO_DB_NAME`
- **AWS Services**: Requires `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_BUCKET_NAME`
- **GitHub OAuth**: Requires `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_REDIRECT_URI`
- **Kafka**: Build server requires `KAFKA_BROKER`, `KAFKA_USERNAME`, `KAFKA_PASSWORD`

**Do not attempt to run the full application stack without proper environment setup**. For testing code changes, use the frontend in isolation or mock the backend services.

## Validation and Testing

### Manual Validation Requirements
**CRITICAL**: No automated test suites exist. All validation must be done manually.

#### Frontend Validation Scenarios
**Always perform these scenarios after making frontend changes:**
1. **Build validation**: Run `npm run build` and verify it completes successfully
2. **Lint validation**: Run `npm run lint` - expect errors but ensure no new critical issues
3. **Development server**: Start with `npm run dev` and verify it loads on http://localhost:5173/
4. **UI Navigation**: Test key user flows:
   - Home page loads correctly
   - Navigation between pages works
   - GitHub authentication flow (if backend is available)
   - Project creation/selection flows
   - Dashboard displays properly

#### API Server Validation
**Warning**: API server requires external services. For code changes:
1. **Expected startup failure**: `npm start` will crash with environment variable errors - this is normal
2. **Dev command issues**: `npm run dev` may fail with "nodemon: not found" - use `npm start` instead
3. Check that routes are properly defined in the codebase
4. Test database models if making schema changes (requires MongoDB)

**Expected error output when starting without environment:**
```bash
TypeError [ERR_INVALID_ARG_TYPE]: The "data" argument must be of type string or an instance of Buffer, TypedArray, or DataView. Received undefined
```
This indicates missing Kafka/environment configuration - expected behavior.

#### Build Process Validation  
The build server implements a sophisticated build pipeline with multiple npm install strategies:
1. First tries: `npm install --legacy-peer-deps`
2. Falls back to: `npm install --force`  
3. Final fallback: `npm install`

**NEVER CANCEL BUILD PROCESSES**: Builds can take 5-10 minutes for complex projects. Always set timeouts to 15+ minutes.

### Code Quality Checks
- **Always run linting before committing**: `cd frontend && npm run lint`
- **Expected linting issues**: The codebase currently has exactly 45 errors and 9 warnings in ESLint - this is normal. Focus only on NEW errors you introduce.
- **Build verification**: Always verify builds complete successfully before committing

## Architecture and Codebase Navigation

### Component Overview
- **frontend/**: React SPA using Vite, TailwindCSS, React Router
  - Key files: `src/App.jsx`, `src/pages/`, `src/components/`
  - Configuration: `vite.config.js`, `tailwind.config.js`, `eslint.config.js`
  
- **api-server/**: Express.js REST API
  - Key directories: `routes/`, `controllers/`, `models/`, `services/`
  - Entry point: `index.js`, App configuration: `app.js`
  - Database: MongoDB with Mongoose ODM
  
- **build_server/**: Automated build service  
  - Main logic: `script.js`
  - Docker deployment: `Dockerfile`, `main.sh`
  - Handles repository cloning, dependency installation, building, and S3 upload
  
- **s3-reverse-proxy/**: Static file serving proxy
  - Entry point: `index.js`
  - Serves deployed sites from S3 buckets

### Key Technical Details
- **Build Output Detection**: Build server checks for output in `dist/`, `build/`, `out/`, then root directory
- **Multi-strategy Dependency Resolution**: Handles ERESOLVE errors with multiple npm install approaches  
- **GitHub Integration**: Supports both public and private repositories with OAuth token handling
- **Environment Variable Management**: Build server filters system vs user-defined environment variables

### Common Development Tasks

#### Adding New Frontend Features
1. Navigate to `frontend/src/`
2. Follow existing component patterns in `components/` and `pages/`
3. Update routing in `App.jsx` if needed
4. Test with `npm run dev`
5. Verify build with `npm run build`
6. Always run `npm run lint` before committing

#### Modifying API Endpoints
1. Navigate to `api-server/routes/` for route definitions
2. Update corresponding controllers in `controllers/`
3. Modify data models in `models/` if needed  
4. Test API startup with `npm run dev` (will fail without DB but should start)

#### Build System Changes
1. Primary logic in `build_server/script.js`
2. Docker configuration in `build_server/Dockerfile`
3. Environment handling in build script initialization
4. **CRITICAL**: Build timeouts should be 15+ minutes for complex projects

## Common Tasks and Expected Outputs

### Frontend Development Workflow
**Standard successful build output:**
```bash
> frontend@0.0.0 build
> vite build

vite v6.3.5 building for production...
transforming...
✓ 1656 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.46 kB │ gzip:   0.30 kB
dist/assets/index-CMJfJ4m_.css   64.98 kB │ gzip:   9.87 kB  
dist/assets/index-hAn7cF3X.js   355.40 kB │ gzip: 104.19 kB
✓ built in 3.33s
```

**Expected ESLint output (54 total issues):**
- 45 errors (mostly prop validation and unused imports)
- 9 warnings (React hooks dependencies)
- **This is normal** - focus only on NEW errors you introduce

**Dev server successful startup:**
```bash
> frontend@0.0.0 dev
> vite

VITE v6.3.5  ready in 207 ms
➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Repository Structure Quick Reference
```
SnapDeploy/
├── .github/
│   └── copilot-instructions.md  # These instructions
├── frontend/                    # React + Vite SPA
│   ├── src/
│   │   ├── App.jsx             # Main app routing
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Route components
│   │   └── contexts/           # React contexts
│   ├── package.json            # Frontend dependencies
│   ├── vite.config.js          # Vite configuration
│   ├── tailwind.config.js      # TailwindCSS config
│   └── eslint.config.js        # ESLint configuration
├── api-server/                  # Express.js backend
│   ├── routes/                 # API route handlers
│   ├── controllers/            # Business logic
│   ├── models/                 # MongoDB schemas
│   ├── services/               # External service integrations
│   └── package.json            # Backend dependencies
├── build_server/               # Automated build service
│   ├── script.js               # Main build logic
│   ├── Dockerfile              # Container configuration
│   └── main.sh                 # Entry point script
└── s3-reverse-proxy/           # Static site serving
    ├── index.js                # Proxy server
    └── package.json            # Proxy dependencies
```

## Common Issues and Solutions

### Frontend Issues
- **ESLint errors**: Expected behavior - 45+ errors are known issues, focus on new errors only
- **Build failures**: Usually dependency-related, try `rm -rf node_modules package-lock.json && npm install`
- **Vite dev server issues**: Try different port with `npm run dev -- --port 5174`

### Dependency Issues  
- **ERESOLVE errors**: Use `npm install --legacy-peer-deps` or `npm install --force`
- **Node version conflicts**: Ensure Node.js 20.19.4+ is being used
- **Build server npm strategies**: The build server automatically tries multiple install strategies

### Development Workflow
- **Always verify builds work** after making changes
- **Use frontend in isolation** for UI development  
- **Mock external services** when testing API changes
- **Set appropriate timeouts** for all build commands (never less than 30 seconds)

## Time Expectations
**CRITICAL TIMING INFORMATION** (measured values):
- Frontend npm install: 29 seconds - Set timeout to 60+ seconds
- API server npm install: 29 seconds - Set timeout to 60+ seconds  
- Build server npm install: 2 seconds - Set timeout to 30+ seconds
- S3 proxy npm install: 1.5 seconds - Set timeout to 30+ seconds
- Frontend build: 3.7 seconds - Set timeout to 30+ seconds  
- Frontend ESLint: 1.2 seconds - Set timeout to 30+ seconds
- Frontend dev server startup: 0.2 seconds - instant
- Build server operations: 5-10 minutes - Set timeout to 15+ minutes, **NEVER CANCEL**

**Always use these timeouts and never cancel long-running build operations.**