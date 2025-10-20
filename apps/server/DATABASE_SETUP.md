# Database Setup Guide

## Issue: Socket Timeout Error

If you encounter the following error:
```
PrismaClientKnownRequestError: Socket timeout (the database failed to respond to a query within the configured timeout)
```

This means Prisma cannot connect to the database, usually because the `DATABASE_URL` environment variable is not set.

## Solution

### 1. Create Environment File

Navigate to the server directory and create a `.env` file:

```bash
cd apps/server
cp .env.example .env
```

### 2. Verify Database Configuration

The `.env` file should contain:

```env
DATABASE_URL="file:./prisma/database.db"
```

This tells Prisma to use SQLite with the database file located at `apps/server/prisma/database.db`.

### 3. Generate Prisma Client

```bash
cd apps/server
pnpm prisma generate
```

### 4. Sync Database Schema

```bash
pnpm prisma db push
```

This will:
- Create the SQLite database file if it doesn't exist
- Apply the schema from `prisma/schema.prisma`
- Generate the Prisma Client

### 5. Verify Database File

Check that the database file was created:

```bash
ls -lh prisma/database.db
```

You should see output like:
```
-rw-r--r--  1 user  staff   4.8M Oct 19 22:54 prisma/database.db
```

## Database Information

- **Type**: SQLite
- **Location**: `apps/server/prisma/database.db`
- **Schema**: `apps/server/prisma/schema.prisma`

## Common Commands

```bash
# Generate Prisma Client
pnpm prisma generate

# Sync database with schema (no migrations)
pnpm prisma db push

# Open Prisma Studio (database GUI)
pnpm prisma studio

# Reset database (WARNING: deletes all data)
pnpm prisma db push --force-reset

# View database schema
pnpm prisma db pull
```

## Troubleshooting

### Issue: Database file locked

If you get a "database is locked" error:
1. Stop all running server instances
2. Close any database viewers (like Prisma Studio)
3. Try again

### Issue: Permission denied

If you get permission errors:
```bash
chmod 644 prisma/database.db
```

### Issue: Cannot find database file

Make sure you're running commands from the `apps/server` directory, or use absolute paths.

## Database Schema Overview

The schema includes these main models:
- **Block** - CKB blockchain blocks
- **Transaction** - CKB transactions
- **Input** - Transaction inputs
- **Output** - Transaction outputs
- **Script** - Lock and type scripts
- **CellDep** - Cell dependencies
- **HeaderDep** - Header dependencies

## Production Considerations

For production deployments:

1. **Consider PostgreSQL**: SQLite is great for development but PostgreSQL is recommended for production
2. **Backup**: Regularly backup the `database.db` file
3. **Performance**: SQLite has limitations with concurrent writes
4. **Scaling**: For high-traffic applications, migrate to PostgreSQL

To switch to PostgreSQL:

1. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. Update `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/ckb_chainviz?schema=public"
   ```

3. Run migrations:
   ```bash
   pnpm prisma migrate dev
   ```
