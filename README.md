# GitHub Clone

A full-featured GitHub-like platform built with the MERN stack (MongoDB, Express.js, React, Node.js).

## Features

- User authentication and authorization
- Repository management
- Issue tracking
- Pull requests
- Real-time notifications
- Code version control
- User profiles
- Search functionality
- Dark mode support

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Git
- npm or yarn

## Setup Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd github-clone
```

2. Install backend dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd client
npm install
cd ..
```

4. Create a .env file in the root directory with the following variables:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
NODE_ENV=development
```

5. Start the development servers:
```bash
# Run both frontend and backend
npm run dev:full

# Run only backend
npm run dev

# Run only frontend
npm run client
```

## Project Structure

```
github-clone/
├── client/                 # React frontend
├── server/                 # Node.js backend
│   ├── config/            # Configuration files
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   └── utils/            # Utility functions
├── .env                   # Environment variables
├── .gitignore            # Git ignore file
├── package.json          # Project dependencies
└── README.md            # Project documentation
```

## API Documentation

The API documentation is available at `/api-docs` when running the server.

## Testing

Run the test suite:
```bash
npm test
```

## Deployment

1. Build the frontend:
```bash
npm run build
```

2. Set up environment variables for production
3. Deploy to your preferred hosting platform (Heroku, AWS, etc.)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License. 