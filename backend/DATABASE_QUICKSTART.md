# Quick Start: Database Procedures & Triggers

## 🚀 Apply Changes

```bash
# Run the new migration
npx sequelize-cli db:migrate

# Verify everything is set up
mysql -u root -p habitbuddy_development -e "SHOW PROCEDURE STATUS WHERE Db = 'habitbuddy_development';"
mysql -u root -p habitbuddy_development -e "SHOW TRIGGERS;"
```

## 📊 New Features

### 1. Automatic Streak Calculation
Habits now track streaks automatically!

**New Fields:**
- `streak` - Current consecutive days
- `longestStreak` - Best streak ever
- `lastCompletedAt` - Last completion timestamp

**Example Response:**
```json
{
  "id": 5,
  "name": "Morning Run",
  "streak": 7,
  "longestStreak": 30,
  "lastCompletedAt": "2025-10-31T08:00:00.000Z",
  "completedDates": ["2025-10-25", "2025-10-26", ...]
}
```

### 2. User Statistics API
Get comprehensive stats for any user:

```bash
curl http://localhost:2000/habits/stats/summary \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "total_habits": 8,
  "habits_with_completions": 7,
  "total_current_streak": 56,
  "best_streak": 45,
  "total_completions": 234
}
```

### 3. Enhanced Completion Endpoints
Completing/uncompleting habits now returns updated streak info:

```bash
# Complete a habit
curl -X POST http://localhost:2000/habits/5/complete \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"date": "2025-10-31"}'
```

**Response includes updated streak:**
```json
{
  "message": "Habit marked as completed",
  "habit": {
    "streak": 8,
    "longestStreak": 30,
    "lastCompletedAt": "2025-10-31T10:30:00.000Z"
  }
}
```

### 4. Manual Streak Recalculation
Force recalculation if needed:

```bash
curl -X POST http://localhost:2000/habits/5/recalculate-streak \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Token Cleanup (Admin)
Manually clean expired reset tokens:

```bash
curl -X POST http://localhost:2000/admin/cleanup-tokens \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🛡️ Protection Features

### 1. Email Validation
Invalid emails are automatically rejected:
```sql
-- ❌ This will fail
INSERT INTO users (email, password) VALUES ('invalid@', 'pass');

-- ✅ This will succeed
INSERT INTO users (email, password) VALUES ('user@example.com', 'pass');
```

### 2. High Streak Protection
Cannot delete habits with 30+ day streak:
```javascript
// This will throw an error if streak >= 30
await habit.destroy();
// Error: "Cannot delete habit with 30+ day streak. Archive it instead."
```

### 3. Automatic Token Cleanup
Expired reset tokens are auto-deleted daily at 2:00 AM.

## 🔧 Troubleshooting

### Enable MySQL Event Scheduler
```sql
-- Check if enabled
SHOW VARIABLES LIKE 'event_scheduler';

-- Enable it
SET GLOBAL event_scheduler = ON;

-- Make it permanent (add to my.cnf or my.ini)
[mysqld]
event_scheduler=ON
```

### Verify Triggers Are Working
```sql
-- Check triggers
SHOW TRIGGERS FROM habitbuddy_development;

-- Should show:
-- - update_last_completed_at
-- - validate_user_email_insert
-- - validate_user_email_update
-- - prevent_high_streak_deletion
-- - auto_calculate_streak
```

### Test Streak Calculation
```javascript
// Create a habit and complete it for 3 days
const habit = await Habit.create({
  name: 'Test',
  userId: 1,
  completedDates: JSON.stringify(['2025-10-29', '2025-10-30', '2025-10-31']),
  frequencyType: 'daily',
  frequencyDays: '[]'
});

// Fetch it back
const result = await Habit.findByPk(habit.id);
console.log(result.streak); // Should be 3
console.log(result.longestStreak); // Should be 3
```

## 📝 Important Notes

1. **Triggers fire automatically** - No code changes needed for streak calculation
2. **Stored procedures are fast** - Run directly on MySQL server
3. **Email validation is strict** - Uses regex pattern
4. **Event scheduler required** - For automatic token cleanup
5. **Backwards compatible** - Old habits will have streak = 0 until updated

## 🔄 Rollback

If you need to remove these features:

```bash
npx sequelize-cli db:migrate:undo
```

This removes:
- All triggers
- All procedures  
- All functions
- Scheduled events
- New columns (streak, longestStreak, lastCompletedAt)

## 📚 Full Documentation

See `DATABASE_PROCEDURES.md` for complete details on:
- All stored procedures
- All triggers
- All functions
- API endpoints
- Security considerations
- Testing strategies

## 🎯 What's Automated Now

✅ Streak calculation (automatic)  
✅ Last completion timestamp (automatic)  
✅ Email validation (automatic)  
✅ Token cleanup (scheduled daily)  
✅ High streak protection (automatic)

## 🤝 Contributing

When adding new database features:
1. Create a new migration file
2. Document in DATABASE_PROCEDURES.md
3. Update this quick reference
4. Add tests
5. Update API documentation

---

**Need Help?** Check the full `DATABASE_PROCEDURES.md` guide or the main `MYSQL_MIGRATION.md`.
