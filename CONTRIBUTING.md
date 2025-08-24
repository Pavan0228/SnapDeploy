# Contributing to SnapDeploy 🤝

We love contributions! SnapDeploy is built by developers, for developers. Whether you're fixing bugs, adding features, or improving documentation, your contributions are welcome.

## 🚀 Quick Start for Contributors

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/SnapDeploy.git
   cd SnapDeploy
   ```
3. **Follow the [Quick Start Guide](QUICKSTART.md)** to set up your development environment
4. **Create a feature branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```
5. **Make your changes** and test them thoroughly
6. **Commit your changes**:
   ```bash
   git commit -m 'Add some amazing feature'
   ```
7. **Push to your fork**:
   ```bash
   git push origin feature/amazing-feature
   ```
8. **Open a Pull Request** on GitHub

## 📋 Development Guidelines

### Code Style

- **JavaScript/Node.js**: Follow ESLint configuration
- **React**: Use functional components with hooks
- **Database**: Use Mongoose models with proper validation
- **API**: Follow RESTful conventions

### File Structure

```
api-server/
├── controllers/     # Request handlers
├── models/         # Database models
├── middlewares/    # Express middlewares
├── routes/         # API routes
├── services/       # Business logic
└── utils/          # Utility functions

frontend/
├── src/
│   ├── components/ # Reusable UI components
│   ├── pages/      # Page components
│   ├── contexts/   # React contexts
│   └── utils/      # Frontend utilities
└── public/         # Static assets
```

### Commit Message Format

Use conventional commits:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

Examples:
```
feat: add support for custom domains
fix: resolve deployment timeout issues
docs: update API documentation
refactor: optimize database queries
```

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Environment details**:
   - OS (Windows, macOS, Linux)
   - Node.js version
   - Browser (for frontend issues)

2. **Steps to reproduce**:
   - Clear, numbered steps
   - Expected vs actual behavior
   - Screenshots if applicable

3. **Error logs**:
   - Browser console errors
   - Server logs
   - Database errors

## ✨ Feature Requests

Before suggesting a feature:

1. **Check existing issues** to avoid duplicates
2. **Provide clear use cases** and examples
3. **Consider the scope** - does it fit SnapDeploy's mission?
4. **Think about implementation** - API changes, UI mockups, etc.

## 🧪 Testing

### Running Tests

```bash
# Frontend tests
cd frontend
npm run test

# API tests (when available)
cd api-server
npm run test

# Integration tests
npm run test:integration
```

### Writing Tests

- **Unit tests**: Test individual functions and components
- **Integration tests**: Test API endpoints and database operations
- **E2E tests**: Test complete user workflows

## 📚 Documentation

### Writing Documentation

- Use clear, concise language
- Include code examples
- Add screenshots for UI changes
- Update API documentation for backend changes

### Documentation Types

- **README.md**: Project overview and setup
- **QUICKSTART.md**: Fast setup guide
- **ARCHITECTURE.md**: System design and flow
- **API docs**: Endpoint documentation
- **Code comments**: Inline documentation

## 🔧 Development Setup

### Prerequisites

- Node.js 18+
- MongoDB 4.4+
- AWS account (for full functionality)
- GitHub OAuth app

### Environment Setup

1. **Copy environment files**:
   ```bash
   cp api-server/.env.example api-server/.env
   cp frontend/.env.example frontend/.env
   ```

2. **Install dependencies**:
   ```bash
   # Install all services
   npm run install:all
   ```

3. **Start services**:
   ```bash
   # Terminal 1 - API Server
   cd api-server && npm run dev

   # Terminal 2 - Frontend  
   cd frontend && npm run dev

   # Terminal 3 - Reverse Proxy
   cd s3-reverse-proxy && npm start
   ```

### Debugging

- **Frontend**: Use React DevTools browser extension
- **Backend**: Use VS Code debugger or console.log
- **Database**: Use MongoDB Compass or mongosh
- **Network**: Use browser DevTools Network tab

## 🎯 Good First Issues

New to SnapDeploy? Look for issues labeled:

- `good first issue` - Simple tasks for beginners
- `documentation` - Help improve docs
- `bug` - Fix reported bugs
- `enhancement` - Small feature additions

## 🔍 Code Review Process

### For Contributors

- Keep PRs focused and small
- Write clear descriptions
- Include tests for new features
- Update documentation as needed
- Respond to feedback promptly

### For Reviewers

- Be constructive and helpful
- Check for security issues
- Verify tests are included
- Ensure documentation is updated
- Test the changes locally

## 🏷️ Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature request
- `documentation` - Documentation needs
- `good first issue` - Good for newcomers
- `help wanted` - Community help needed
- `priority: high` - Urgent issues
- `priority: low` - Nice-to-have fixes

## 📞 Getting Help

- **Discord**: Join our community (link coming soon)
- **GitHub Issues**: Ask questions in issues
- **Email**: contact@snapdeploy.com
- **Documentation**: Check the docs first

## 🎉 Recognition

Contributors are recognized in:

- **Contributors list** in README
- **Release notes** for significant contributions
- **GitHub contributors graph**
- **Special mentions** in project updates

## 📄 License

By contributing to SnapDeploy, you agree that your contributions will be licensed under the project's ISC License.

---

## 💡 Tips for Success

1. **Start small** - Make your first PR simple
2. **Ask questions** - We're here to help
3. **Read the code** - Understand before changing
4. **Test thoroughly** - Ensure your changes work
5. **Be patient** - Reviews take time
6. **Have fun** - Enjoy building awesome software!

Thank you for contributing to SnapDeploy! 🚀