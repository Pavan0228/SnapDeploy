# SnapDeploy Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│     Frontend    │────│   API Server    │────│    MongoDB      │
│  (React + Vite) │    │ (Node.js/Express)│    │   Database      │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │                       │
         │                       ▼
         │              ┌─────────────────┐
         │              │                 │
         │              │   GitHub API    │
         │              │   (OAuth &      │
         │              │  Repositories)  │
         │              │                 │
         │              └─────────────────┘
         │                       │
         │                       │
         │                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│  User Browser   │────│  S3 Reverse     │────│    AWS ECS      │
│  (subdomain.    │    │     Proxy       │    │  (Build Tasks)  │
│   domain.com)   │    │  (Routing)      │    │                 │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │                 │    │                 │
                       │     AWS S3      │    │  Build Server   │
                       │ (Static Hosting)│    │   (Docker)      │
                       │                 │    │                 │
                       └─────────────────┘    └─────────────────┘
```

## Deployment Flow

```
1. User creates project in Frontend
         │
         ▼
2. API Server validates and stores project
         │
         ▼
3. API Server triggers ECS build task
         │
         ▼
4. Build Server (Docker container):
   - Clones GitHub repository
   - Installs dependencies (npm install)
   - Builds project (npm run build)
   - Uploads to S3
         │
         ▼
5. S3 Reverse Proxy routes subdomain traffic to S3
         │
         ▼
6. User accesses deployed site at subdomain.domain.com
```

## Service Communication

```
Frontend ←→ API Server ←→ MongoDB
    │           │
    │           ├─→ GitHub API (OAuth, Repos)
    │           │
    │           └─→ AWS ECS (Trigger builds)
    │
    └─→ S3 Reverse Proxy ←→ AWS S3

Build Server (ECS Task):
    ├─→ GitHub (Clone repo)
    ├─→ AWS S3 (Upload files)
    └─→ Kafka/API (Stream logs)
```