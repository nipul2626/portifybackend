# Portfolio Platform - Backend

Backend API for the AI-powered portfolio creation platform.

## Tech Stack

- **Runtime:** Node.js 20+ with TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL (via Prisma ORM)
- **Authentication:** JWT + OAuth (Google, GitHub, LinkedIn)
- **Email:** Resend
- **File Upload:** Cloudinary (future)

## Setup

### Prerequisites

- Node.js 20+
- PostgreSQL database (or Neon.tech account)
- Git

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd portfolio-backend
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

Then edit `.env` and fill in your actual values:
- `DATABASE_URL`: Your PostgreSQL connection string
- `JWT_SECRET`: Random secret key
- `REFRESH_TOKEN_SECRET`: Another random secret key
- OAuth credentials (optional for now)
- `RESEND_API_KEY`: Get from https://resend.com
- `FRONTEND_URL`: Your frontend URL

4. Run database migrations
```bash
npx prisma migrate dev
npx prisma generate
```

5. Start development server
```bash
npm run dev
```

Server will run on http://localhost:3001

## Available Scripts

- `npm run dev` - Start development server with auto-reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma migrate dev` - Create and apply migrations

## API Endpoints

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login with email/password
- `GET /auth/verify-email/:token` - Verify email
- `POST /auth/logout` - Logout (requires auth)
- `GET /auth/me` - Get current user (requires auth)
- `POST /auth/refresh` - Refresh access token

### OAuth
- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/github` - Initiate GitHub OAuth
- `GET /auth/linkedin` - Initiate LinkedIn OAuth

## Environment Variables

See `.env.example` for all required environment variables.

## Database Schema

Using Prisma ORM. Schema located in `prisma/schema.prisma`.

Main tables:
- `users` - User accounts
- `sessions` - Active sessions (refresh tokens)

## Project Structure
```
src/
├── config/          # Configuration files
├── controllers/     # Request handlers
├── middleware/      # Express middleware
├── routes/          # API routes
├── services/        # Business logic
├── utils/           # Helper functions
└── app.ts           # Main application file
```

## Deployment

See DEPLOYMENT.md for deployment instructions.

## License

MIT