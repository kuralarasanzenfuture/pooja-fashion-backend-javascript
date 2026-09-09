# Pooja Fashion Backend

Modern, scalable backend API for the Pooja Fashion ERP/POS retail management system built with Node.js, Express, PostgreSQL, and Zod.

## Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: PostgreSQL (`pg` pool) / MySQL compatible
- **Validation**: Zod
- **Authentication**: JWT (Access & Refresh Tokens) + bcryptjs
- **Security**: Helmet, CORS, Express Rate Limit
- **File Uploads**: Multer
- **Logging**: Pino / Morgan

---

## Directory Structure

```text
pooja-fashion-backend/
├── src/
│   ├── app.js                 # Express application configuration
│   ├── server.js              # Server entry point and database connection
│   ├── config/                # Environment, database, jwt, cors, app settings
│   ├── database/              # DB connection, migrations, seeders
│   ├── middlewares/           # Auth, error, rateLimit, validation, upload, etc.
│   ├── routes/                # Central routing table
│   ├── modules/               # Domain-driven feature modules
│   ├── shared/                # Constants, errors, types, utilities, shared services
│   ├── uploads/               # Uploaded files (products, employees, documents)
│   └── docs/                  # API and Swagger documentation
├── tests/
│   ├── unit/                  # Unit test suites
│   └── integration/           # Integration API tests
├── .env                       # Environment variables (local)
├── .env.example               # Template environment variables
├── eslint.config.js           # ESLint configuration
├── prettier.config.js         # Prettier formatting rules
└── package.json
```

---

## Getting Started

### 1. Prerequisites

- Node.js >= 18.0.0
- PostgreSQL database instance

### 2. Installation

```bash
npm install
```

### 3. Environment Configuration

Copy `.env.example` to `.env` and fill in your configuration:

```bash
cp .env.example .env
```

### 4. Running the Application

```bash
# Start development server (with nodemon)
npm run dev

# Start production server
npm start
```

### 5. Code Quality & Testing

```bash
# Run linter
npm run lint

# Format code
npm run format

# Run tests
npm test
```

### 6. Database Auto-Creation & Migrations
When running `npm start` or `npm run dev`, the server automatically:
1. Auto-creates the database if it doesn't exist (`ensureDatabaseExists`).
2. Tracks and applies all unapplied SQL migrations transactionally (`runMigrations`).

You can also run migrations manually via CLI:
```bash
# Run all pending migrations
npm run migrate

# Check status of all migrations (applied vs pending)
npm run migrate:status
```


---

## Health Check

- `GET /health` - Base server health
- `GET /api/health` - API route health
