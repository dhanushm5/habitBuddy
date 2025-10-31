'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Add audit timestamp columns to habits table
    await queryInterface.addColumn('habits', 'lastCompletedAt', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Timestamp of last completion',
    });

    await queryInterface.addColumn('habits', 'streak', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false,
      comment: 'Current streak count',
    });

    await queryInterface.addColumn('habits', 'longestStreak', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false,
      comment: 'Longest streak achieved',
    });

    // 2. Create stored procedure to calculate streak
    await queryInterface.sequelize.query(`
      CREATE PROCEDURE calculate_habit_streak(IN habit_id INT)
      BEGIN
        DECLARE current_streak INT DEFAULT 0;
        DECLARE longest_streak INT DEFAULT 0;
        DECLARE completed_dates_json TEXT;
        DECLARE date_cursor DATE;
        DECLARE prev_date DATE;
        DECLARE temp_streak INT DEFAULT 0;
        DECLARE done INT DEFAULT 0;
        DECLARE idx INT DEFAULT 0;
        DECLARE total_dates INT DEFAULT 0;
        
        -- Get completed dates from habit
        SELECT completedDates INTO completed_dates_json
        FROM habits
        WHERE id = habit_id;
        
        -- Create temporary table to store dates
        DROP TEMPORARY TABLE IF EXISTS temp_dates;
        CREATE TEMPORARY TABLE temp_dates (
          date_val DATE,
          sort_order INT AUTO_INCREMENT PRIMARY KEY
        );
        
        -- Parse JSON array and insert dates (simplified - assumes valid JSON array)
        -- In production, you'd use JSON_TABLE in MySQL 5.7.8+
        SET @json_array = completed_dates_json;
        
        -- For MySQL 5.7.8+, use JSON_TABLE
        IF @json_array IS NOT NULL AND @json_array != '[]' THEN
          INSERT INTO temp_dates (date_val)
          SELECT DATE(JSON_UNQUOTE(JSON_EXTRACT(completed_dates_json, CONCAT('$[', idx, ']'))))
          FROM (
            SELECT 0 AS idx UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL 
            SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL 
            SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9
          ) numbers
          WHERE JSON_EXTRACT(completed_dates_json, CONCAT('$[', idx, ']')) IS NOT NULL
          ORDER BY date_val DESC;
        END IF;
        
        -- Calculate streaks
        SELECT COUNT(*) INTO total_dates FROM temp_dates;
        
        IF total_dates > 0 THEN
          SET idx = 1;
          SET prev_date = NULL;
          SET temp_streak = 0;
          
          -- Loop through sorted dates
          WHILE idx <= total_dates DO
            SELECT date_val INTO date_cursor FROM temp_dates WHERE sort_order = idx;
            
            IF prev_date IS NULL THEN
              SET temp_streak = 1;
              SET prev_date = date_cursor;
            ELSE
              -- Check if consecutive days
              IF DATEDIFF(prev_date, date_cursor) = 1 THEN
                SET temp_streak = temp_streak + 1;
              ELSE
                -- Streak broken, check if it's the longest
                IF temp_streak > longest_streak THEN
                  SET longest_streak = temp_streak;
                END IF;
                SET temp_streak = 1;
              END IF;
              SET prev_date = date_cursor;
            END IF;
            
            SET idx = idx + 1;
          END WHILE;
          
          -- Check final streak
          IF temp_streak > longest_streak THEN
            SET longest_streak = temp_streak;
          END IF;
          
          -- Current streak is the most recent consecutive days
          SET current_streak = temp_streak;
        END IF;
        
        -- Update habit with calculated streaks
        UPDATE habits
        SET streak = current_streak,
            longestStreak = GREATEST(longestStreak, longest_streak)
        WHERE id = habit_id;
        
        DROP TEMPORARY TABLE IF EXISTS temp_dates;
      END
    `);

    // 3. Create stored procedure to clean up expired reset tokens
    await queryInterface.sequelize.query(`
      CREATE PROCEDURE cleanup_expired_tokens()
      BEGIN
        UPDATE users
        SET resetToken = NULL,
            resetTokenExpires = NULL
        WHERE resetTokenExpires IS NOT NULL
          AND resetTokenExpires < NOW();
          
        SELECT ROW_COUNT() AS deleted_tokens;
      END
    `);

    // 4. Create stored procedure to get user statistics
    await queryInterface.sequelize.query(`
      CREATE PROCEDURE get_user_stats(IN user_id INT)
      BEGIN
        SELECT 
          COUNT(*) AS total_habits,
          SUM(CASE WHEN JSON_LENGTH(completedDates) > 0 THEN 1 ELSE 0 END) AS habits_with_completions,
          SUM(streak) AS total_current_streak,
          MAX(longestStreak) AS best_streak,
          SUM(JSON_LENGTH(completedDates)) AS total_completions
        FROM habits
        WHERE userId = user_id;
      END
    `);

    // 5. Trigger: Update lastCompletedAt when completedDates changes
    await queryInterface.sequelize.query(`
      CREATE TRIGGER update_last_completed_at
      BEFORE UPDATE ON habits
      FOR EACH ROW
      BEGIN
        -- If completedDates changed and is not empty
        IF NEW.completedDates != OLD.completedDates 
           AND NEW.completedDates IS NOT NULL 
           AND NEW.completedDates != '[]' THEN
          SET NEW.lastCompletedAt = NOW();
        END IF;
      END
    `);

    // 6. Trigger: Validate email format on user insert/update
    await queryInterface.sequelize.query(`
      CREATE TRIGGER validate_user_email_insert
      BEFORE INSERT ON users
      FOR EACH ROW
      BEGIN
        IF NEW.email NOT REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$' THEN
          SIGNAL SQLSTATE '45000'
          SET MESSAGE_TEXT = 'Invalid email format';
        END IF;
      END
    `);

    await queryInterface.sequelize.query(`
      CREATE TRIGGER validate_user_email_update
      BEFORE UPDATE ON users
      FOR EACH ROW
      BEGIN
        IF NEW.email NOT REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$' THEN
          SIGNAL SQLSTATE '45000'
          SET MESSAGE_TEXT = 'Invalid email format';
        END IF;
      END
    `);

    // 7. Trigger: Prevent deletion of habits with high streaks (optional safety)
    await queryInterface.sequelize.query(`
      CREATE TRIGGER prevent_high_streak_deletion
      BEFORE DELETE ON habits
      FOR EACH ROW
      BEGIN
        IF OLD.longestStreak >= 30 THEN
          SIGNAL SQLSTATE '45000'
          SET MESSAGE_TEXT = 'Cannot delete habit with 30+ day streak. Archive it instead.';
        END IF;
      END
    `);

    // 8. Trigger: Auto-calculate streak on completedDates update
    await queryInterface.sequelize.query(`
      CREATE TRIGGER auto_calculate_streak
      AFTER UPDATE ON habits
      FOR EACH ROW
      BEGIN
        -- Only recalculate if completedDates changed
        IF NEW.completedDates != OLD.completedDates THEN
          CALL calculate_habit_streak(NEW.id);
        END IF;
      END
    `);

    // 9. Create function to check if habit is due today
    await queryInterface.sequelize.query(`
      CREATE FUNCTION is_habit_due_today(
        frequency_type VARCHAR(20),
        frequency_days TEXT,
        completed_dates TEXT
      ) RETURNS BOOLEAN
      DETERMINISTIC
      BEGIN
        DECLARE today_day_name VARCHAR(10);
        DECLARE today_date VARCHAR(10);
        
        SET today_day_name = DAYNAME(CURDATE());
        SET today_date = DATE_FORMAT(CURDATE(), '%Y-%m-%d');
        
        -- Check if already completed today
        IF completed_dates LIKE CONCAT('%', today_date, '%') THEN
          RETURN FALSE;
        END IF;
        
        -- Check based on frequency
        IF frequency_type = 'daily' THEN
          RETURN TRUE;
        ELSEIF frequency_type = 'weekly' THEN
          -- Check if today's day is in frequencyDays
          RETURN frequency_days LIKE CONCAT('%', today_day_name, '%');
        ELSEIF frequency_type = 'custom' THEN
          -- Check if today's day is in frequencyDays
          RETURN frequency_days LIKE CONCAT('%', today_day_name, '%');
        ELSE
          RETURN FALSE;
        END IF;
      END
    `);

    // 10. Create event scheduler to cleanup expired tokens daily
    await queryInterface.sequelize.query(`
      CREATE EVENT IF NOT EXISTS cleanup_tokens_daily
      ON SCHEDULE EVERY 1 DAY
      STARTS (TIMESTAMP(CURRENT_DATE) + INTERVAL 1 DAY + INTERVAL 2 HOUR)
      DO CALL cleanup_expired_tokens()
    `);

    console.log('✅ Created stored procedures, triggers, and functions');
  },

  down: async (queryInterface, Sequelize) => {
    // Drop event
    await queryInterface.sequelize.query('DROP EVENT IF EXISTS cleanup_tokens_daily');

    // Drop function
    await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS is_habit_due_today');

    // Drop triggers
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS auto_calculate_streak');
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS prevent_high_streak_deletion');
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS validate_user_email_update');
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS validate_user_email_insert');
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS update_last_completed_at');

    // Drop procedures
    await queryInterface.sequelize.query('DROP PROCEDURE IF EXISTS get_user_stats');
    await queryInterface.sequelize.query('DROP PROCEDURE IF EXISTS cleanup_expired_tokens');
    await queryInterface.sequelize.query('DROP PROCEDURE IF EXISTS calculate_habit_streak');

    // Remove columns
    await queryInterface.removeColumn('habits', 'longestStreak');
    await queryInterface.removeColumn('habits', 'streak');
    await queryInterface.removeColumn('habits', 'lastCompletedAt');

    console.log('✅ Rolled back triggers and procedures');
  }
};
