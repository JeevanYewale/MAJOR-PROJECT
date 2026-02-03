# Quick Start Guide

Get TravelStay running in 5 minutes!

## Prerequisites

- Node.js 16+
- MongoDB running locally
- Git

## Installation

```bash
# Clone repository
git clone https://github.com/JeevanYewale/travelstay-clone.git
cd travelstay-clone

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Initialize database
npm run init-db

# Start development server
npm run dev
```

## Access Application

- **URL:** http://localhost:8080
- **Admin Login:** admin / admin123
- **API Docs:** See [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

## Using Docker

```bash
# Start with Docker Compose
docker-compose up

# Access at http://localhost:8080
```

## Common Commands

```bash
# Development
npm run dev          # Start with auto-reload

# Testing
npm test            # Run all tests
npm run test:watch  # Watch mode

# Database
npm run init-db     # Initialize database
npm run reset-db    # Reset database
npm run seed        # Seed sample data

# Production
npm start           # Start server
npm run build       # Build for production
```

## Project Structure

```
├── config/          # Configuration files
├── controllers/     # Business logic
├── middleware/      # Express middleware
├── models/          # Database schemas
├── routes/          # API routes
├── utils/           # Utility functions
├── views/           # EJS templates
├── public/          # Static files
└── test/            # Test files
```

## Key Features

- ✅ User authentication
- ✅ Listing management
- ✅ Booking system
- ✅ Reviews and ratings
- ✅ Real-time messaging
- ✅ Admin dashboard
- ✅ Form management
- ✅ Analytics

## Troubleshooting

### MongoDB Connection Error
```bash
# Make sure MongoDB is running
mongod

# Or use Docker
docker run -d -p 27017:27017 mongo
```

### Port Already in Use
```bash
# Change PORT in .env
PORT=3000
```

### Dependencies Issue
```bash
# Clean install
npm run clean-install
```

## Next Steps

1. Read [CONTRIBUTING.md](CONTRIBUTING.md)
2. Check [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
3. Review [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
4. Run tests: `npm test`
5. Start coding!

## Need Help?

- Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- Read [README.md](README.md)
- Open an issue on GitHub
- Check existing issues

## Resources

- [Express.js Docs](https://expressjs.com/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [Node.js Docs](https://nodejs.org/docs/)
- [EJS Docs](https://ejs.co/)

Happy coding! 🚀
