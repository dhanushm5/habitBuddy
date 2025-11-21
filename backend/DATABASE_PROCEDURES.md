# Database Procedures, Triggers, and Functions

This document describes all the stored procedures, triggers, and functions added to enhance database robustness and automation.

## Table of Contents
1. [New Columns](#new-columns)
2. [Stored Procedures](#stored-procedures)
3. [Triggers](#triggers)
4. [Functions](#functions)
5. [Scheduled Events](#scheduled-events)
6. [API Endpoints](#api-endpoints)

---

## New Columns

### habits table
- **`lastCompletedAt`** (DATETIME): Timestamp of the last completion
- **`streak`** (INTEGER): Current consecutive completion streak
- **`longestStreak`** (INTEGER): Best streak ever achieved

---

## Stored Procedures

### 1. `calculate_habit_streak(habit_id INT)`
**Purpose**: Calculates current and longest streak for a habit based on completed dates.

**Logic**:
- Parses the `completedDates` JSON array
- Sorts dates in descending order
- Counts consecutive days
- Updates both `streak` and `longestStreak` columns

**Usage**:
```sql
CALL calculate_habit_streak(5);
```

**When Called**:
- Automatically after UPDATE on habits table (via trigger)
- Manually via API: `POST /habits/:id/recalculate-streak`

---

### 2. `cleanup_expired_tokens()`
**Purpose**: Removes expired password reset tokens from users table.

**Logic**:
- Finds all users where `resetTokenExpires < NOW()`
- Sets `resetToken` and `resetTokenExpires` to NULL
- Returns count of cleaned tokens

**Usage**:
```sql
CALL cleanup_expired_tokens();
```

**When Called**:
- Automatically daily at 2:00 AM (via scheduled event)
- Manually via API: `POST /admin/cleanup-tokens`

**Returns**:
```json
{ "deleted_tokens": 3 }
```

---

### 3. `get_user_stats(user_id INT)`
**Purpose**: Generates comprehensive statistics for a user's habits.

**Returns**:
- `total_habits`: Total number of habits
- `habits_with_completions`: Habits that have been completed at least once
- `total_current_streak`: Sum of all current streaks
- `best_streak`: Highest streak among all habits
- `total_completions`: Total completion count across all habits

**Usage**:
```sql
CALL get_user_stats(123);
```

**API Endpoint**: `GET /habits/stats/summary`

**Example Response**:
```json
{
  "total_habits": 5,
  "habits_with_completions": 4,
  "total_current_streak": 42,
  "best_streak": 30,
  "total_completions": 156
}
```

---

## Triggers

### 1. `update_last_completed_at`
**Type**: BEFORE UPDATE on `habits`

**Purpose**: Automatically updates `lastCompletedAt` when completedDates changes.

**Logic**:
```
IF completedDates changed AND not empty
  SET lastCompletedAt = NOW()
```

**Example**:
When you complete a habit, this trigger automatically timestamps it.

---

### 2. `validate_user_email_insert` & `validate_user_email_update`
**Type**: BEFORE INSERT/UPDATE on `users`

**Purpose**: Validates email format before saving to database.

**Validation**:
- Must match pattern: `[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}`
- Examples:
  - ✅ `user@example.com`
  - ✅ `john.doe+test@domain.co.uk`
  - ❌ `invalid@`
  - ❌ `@domain.com`

**Error**:
```
SQLSTATE '45000': Invalid email format
```

---

### 3. `prevent_high_streak_deletion`
**Type**: BEFORE DELETE on `habits`

**Purpose**: Prevents accidental deletion of habits with significant progress.

**Logic**:
```
IF longestStreak >= 30 THEN
  RAISE ERROR
```

**Error**:
```
SQLSTATE '45000': Cannot delete habit with 30+ day streak. Archive it instead.
```

**Rationale**: Protects user achievements from accidental deletion.

**Workaround**: If you need to delete, first update `longestStreak` to < 30.

---

### 4. `auto_calculate_streak`
**Type**: AFTER UPDATE on `habits`

**Purpose**: Automatically recalculates streaks when completedDates changes.

**Logic**:
```
IF completedDates changed THEN
  CALL calculate_habit_streak(habit_id)
```

**Benefits**:
- No manual streak calculation needed
- Always accurate streak data
- Automatic update on complete/incomplete actions

---

## Functions

### 1. `is_habit_due_today(frequency_type, frequency_days, completed_dates)`
**Returns**: BOOLEAN

**Purpose**: Determines if a habit is due today based on frequency and completion status.

**Parameters**:
- `frequency_type`: 'daily' | 'weekly' | 'custom'
- `frequency_days`: JSON array of days (e.g., `["Monday", "Wednesday"]`)
- `completed_dates`: JSON array of completed dates

**Logic**:
1. Check if already completed today → return FALSE
2. If frequency = 'daily' → return TRUE
3. If frequency = 'weekly' or 'custom' → check if today's day is in frequencyDays

**Usage**:
```sql
SELECT name, is_habit_due_today(frequencyType, frequencyDays, completedDates) as is_due
FROM habits
WHERE userId = 123;
```

**Example**:
```sql
-- Habit: "Exercise" on Mon, Wed, Fri
-- Today: Wednesday, not yet completed
SELECT is_habit_due_today('weekly', '["Monday","Wednesday","Friday"]', '[]');
-- Returns: TRUE

-- Same habit, but already completed today
SELECT is_habit_due_today('weekly', '["Monday","Wednesday","Friday"]', '["2025-10-31"]');
-- Returns: FALSE
```

---

## Scheduled Events

### 1. `cleanup_tokens_daily`
**Schedule**: Every 1 day at 2:00 AM

**Purpose**: Automatically cleans up expired password reset tokens.

**Action**: Calls `cleanup_expired_tokens()` procedure

**Status Check**:
```sql
SHOW EVENTS;
```

**Enable/Disable**:
```sql
-- Enable
ALTER EVENT cleanup_tokens_daily ENABLE;

-- Disable
ALTER EVENT cleanup_tokens_daily DISABLE;
```

**Note**: Requires MySQL Event Scheduler to be enabled:
```sql
SET GLOBAL event_scheduler = ON;
```

---

## API Endpoints

### Statistics
```http
GET /habits/stats/summary
Authorization: Bearer <token>
```

**Response**:
```json
{
  "total_habits": 8,
  "habits_with_completions": 7,
  "total_current_streak": 56,
  "best_streak": 45,
  "total_completions": 234
}
```

---

### Manual Token Cleanup
```http
POST /admin/cleanup-tokens
Authorization: Bearer <token>
```

**Response**:
```json
{
  "message": "Token cleanup completed",
  "deletedCount": 3
}
```

---

### Recalculate Habit Streak
```http
POST /habits/:id/recalculate-streak
Authorization: Bearer <token>
```

**Response**:
```json
{
  "message": "Streak recalculated successfully",
  "habit": {
    "id": 5,
    "name": "Morning Run",
    "streak": 7,
    "longestStreak": 30,
    "completedDates": ["2025-10-25", "2025-10-26", ...],
    ...
  }
}
```

---

### Habit Completion (Enhanced)
```http
POST /habits/:id/complete
Authorization: Bearer <token>
Content-Type: application/json

{
  "date": "2025-10-31"
}
```

**Response** (now includes updated streak info):
```json
{
  "message": "Habit marked as completed",
  "habit": {
    "id": 5,
    "name": "Morning Run",
    "streak": 8,
    "longestStreak": 30,
    "lastCompletedAt": "2025-10-31T10:30:00.000Z",
    ...
  }
}
```

---

## Running the Migration

```bash
# Run the migration
npx sequelize-cli db:migrate

# Verify triggers and procedures
mysql -u root -p habitbuddy_development

# Check procedures
SHOW PROCEDURE STATUS WHERE Db = 'habitbuddy_development';

# Check triggers
SHOW TRIGGERS;

# Check functions
SHOW FUNCTION STATUS WHERE Db = 'habitbuddy_development';

# Check events
SHOW EVENTS;
```

---

## Rollback

If you need to rollback these changes:

```bash
npx sequelize-cli db:migrate:undo
```

This will:
- Drop all triggers
- Drop all procedures
- Drop all functions
- Drop scheduled events
- Remove new columns

---

## Benefits

### 1. Data Integrity
- ✅ Email validation prevents invalid data
- ✅ Streak protection prevents accidental deletion
- ✅ Automatic cleanup of stale tokens

### 2. Performance
- ✅ Stored procedures run on database server (faster)
- ✅ Complex calculations happen once, not on every query
- ✅ Reduced network traffic

### 3. Automation
- ✅ Automatic streak calculation
- ✅ Automatic timestamp updates
- ✅ Scheduled maintenance tasks

### 4. Consistency
- ✅ Business logic enforced at database level
- ✅ Same validation rules for all clients
- ✅ Cannot bypass via direct SQL

---

## Troubleshooting

### Event Scheduler Not Running
```sql
-- Check status
SHOW VARIABLES LIKE 'event_scheduler';

-- Enable
SET GLOBAL event_scheduler = ON;

-- Persist (add to my.cnf/my.ini)
[mysqld]
event_scheduler=ON
```

### Trigger Not Firing
```sql
-- Check if trigger exists
SHOW TRIGGERS LIKE 'habits';

-- Check for errors
SHOW WARNINGS;
```

### Procedure Errors
```sql
-- Test procedure manually
CALL calculate_habit_streak(5);

-- Check for errors
SHOW WARNINGS;
```

---

## Security Considerations

1. **Stored Procedures**: Run with DEFINER privileges - ensure MySQL user has minimal required permissions
2. **Triggers**: Cannot be bypassed - good for critical business logic
3. **Email Validation**: Regex-based, may need updates for new TLDs
4. **Streak Protection**: Can be overridden by updating longestStreak before deletion if truly needed

---

## Future Enhancements

Potential additions:
- Archive table for deleted habits with high streaks
- Audit log trigger for sensitive operations
- Procedure to generate habit recommendations
- Function to predict next completion date
- Materialized view for leaderboard

---

## Testing

### Test Streak Calculation
```sql
-- Insert test habit
INSERT INTO habits (name, userId, completedDates, frequencyType, frequencyDays)
VALUES ('Test', 1, '["2025-10-29","2025-10-30","2025-10-31"]', 'daily', '[]');

-- Check streaks
SELECT id, name, streak, longestStreak FROM habits WHERE name = 'Test';
```

### Test Email Validation
```sql
-- This should fail
INSERT INTO users (email, password) VALUES ('invalid-email', 'password');
-- Error: Invalid email format

-- This should succeed
INSERT INTO users (email, password) VALUES ('test@example.com', 'password');
```

### Test Token Cleanup
```sql
-- Insert expired token
UPDATE users SET resetToken = 'test123', resetTokenExpires = '2025-01-01' WHERE id = 1;

-- Run cleanup
CALL cleanup_expired_tokens();

-- Verify
SELECT resetToken FROM users WHERE id = 1;
-- Should be NULL
```

---

## Maintenance

### Monitor Performance
```sql
-- Check slow procedures
SELECT * FROM mysql.slow_log WHERE sql_text LIKE '%calculate_habit_streak%';

-- Check procedure execution count (MySQL 5.7+)
SELECT * FROM performance_schema.events_statements_summary_by_digest
WHERE DIGEST_TEXT LIKE '%calculate_habit_streak%';
```

### Update Procedures
To modify a procedure:
1. Create a new migration file
2. DROP PROCEDURE IF EXISTS procedure_name
3. CREATE PROCEDURE with new logic
4. Test thoroughly

---

For questions or issues, refer to the main MYSQL_MIGRATION.md guide.
