# PMS Nest API

## Requirements

- Node.js 22.11.0
- npm 10.9.2
- MySQL 8+

## Database setup

1. Copy `.env.example` to `.env` and set the MySQL connection values.
2. Create the database using the same name as `DATABASE_NAME` with the
   `utf8mb4` character set.
3. Install dependencies and apply the schema:

```bash
npm install
npm run db:migrate
```

Optionally seed the initial admin user:

```bash
npm run db:seed
```

The application and Knex CLI both use the `mysql2` driver. All database
timestamps are read and written in UTC.
