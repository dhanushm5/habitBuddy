# MySQL Migration Guide

## Overview
This project has been migrated from MongoDB to MySQL using Sequelize ORM.

## Prerequisites
- MySQL Server installed (v5.7+ or v8.0+)
- Node.js and npm installed

## Environment Setup

1. **Copy the example environment file:**
   ```bash
   cp ../.env.example ../.env
   ```

2. **Update your `.env` file with MySQL credentials:**
   ```env
   MYSQL_HOST=127.0.0.1
   MYSQL_PORT=3306
   MYSQL_USER=root
   MYSQL_PASSWORD=your_mysql_password
   MYSQL_DB=habitbuddy_development
   
   JWT_SECRET=your_jwt_secret_key_here
   PORT=2000
   
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password
   ```

## Database Setup

1. **Create the database:**
   ```bash
   npm run db:create
   ```

2. **Run migrations:**
   ```bash
   npm run migrate
   ```

3. **Or run both in one command:**
   ```bash
   npm run setup-db
   ```

## Running the Server

```bash
npm start
```

The server will start on `http://localhost:2000` (or the PORT specified in your .env file).

## Database Schema

### Users Table
- `id` (INT, Primary Key, Auto Increment)
- `email` (VARCHAR, Unique)
- `password` (VARCHAR, Hashed)
- `resetToken` (VARCHAR, Nullable)
- `resetTokenExpires` (DATETIME, Nullable)
- `createdAt` (DATETIME)
- `updatedAt` (DATETIME)

### Habits Table
- `id` (INT, Primary Key, Auto Increment)
- `name` (VARCHAR)
- `frequencyDays` (TEXT, JSON Array)
- `color` (VARCHAR)
- `reminderTime` (VARCHAR)
- `completedDates` (TEXT, JSON Array)
- `startDate` (DATETIME)
- `userId` (INT, Foreign Key → users.id)
- `createdAt` (DATETIME)
- `updatedAt` (DATETIME)

### Avatars Table
- `id` (INT, Primary Key, Auto Increment)
- `color` (VARCHAR)
- `accessory` (VARCHAR)
- `shape` (VARCHAR)
- `userId` (INT, Foreign Key → users.id, Unique)
- `createdAt` (DATETIME)
- `updatedAt` (DATETIME)

## Migration Scripts

- `npm run db:create` - Create the database
- `npm run migrate` - Run all pending migrations
- `npm run migrate:undo` - Undo the last migration
- `npm run setup-db` - Create database and run migrations

## Key Changes from MongoDB

1. **ID Fields**: MongoDB's `_id` (ObjectId) → MySQL's `id` (INTEGER)
   - The API still returns `_id` for frontend compatibility
   
2. **Array Fields**: Stored as JSON strings in TEXT columns
   - `frequencyDays`: Array of days
   - `completedDates`: Array of completion dates
   
3. **Relationships**: Explicitly defined foreign keys with CASCADE delete
   - Users → Habits (One-to-Many)
   - Users → Avatars (One-to-One)

4. **Query Syntax**: 
   - MongoDB: `collection.findOne({ email })`
   - Sequelize: `User.findOne({ where: { email } })`

## Troubleshooting

### "Unknown database" error
Run: `npm run db:create`

### Migration errors
Check your MySQL credentials in `.env` and ensure MySQL server is running.

### Connection refused
Ensure MySQL is running: `mysql.server start` (macOS) or `sudo service mysql start` (Linux)
