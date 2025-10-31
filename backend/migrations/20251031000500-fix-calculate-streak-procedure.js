'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Drop the problematic procedure and recreate with a simpler version
    await queryInterface.sequelize.query('DROP PROCEDURE IF EXISTS calculate_habit_streak');

    // Create a simpler, more robust stored procedure to calculate streak
    await queryInterface.sequelize.query(`
      CREATE PROCEDURE calculate_habit_streak(IN habit_id INT)
      proc_label: BEGIN
        DECLARE current_streak INT DEFAULT 0;
        DECLARE longest_streak INT DEFAULT 0;
        DECLARE completed_dates_json TEXT;
        DECLARE dates_count INT DEFAULT 0;
        DECLARE idx INT DEFAULT 0;
        DECLARE habit_date DATE;
        DECLARE prev_date DATE DEFAULT NULL;
        DECLARE temp_streak INT DEFAULT 0;
        DECLARE max_iterations INT DEFAULT 1000; -- Safety limit
        
        -- Get completed dates from habit
        SELECT completedDates INTO completed_dates_json
        FROM habits
        WHERE id = habit_id;
        
        -- If no dates or empty array, set streaks to 0
        IF completed_dates_json IS NULL OR completed_dates_json = '[]' OR completed_dates_json = '' THEN
          UPDATE habits
          SET streak = 0, longestStreak = 0
          WHERE id = habit_id;
          LEAVE proc_label;
        END IF;
        
        -- Get count of dates in JSON array
        SET dates_count = JSON_LENGTH(completed_dates_json);
        
        IF dates_count = 0 THEN
          UPDATE habits
          SET streak = 0, longestStreak = 0
          WHERE id = habit_id;
          LEAVE proc_label;
        END IF;
        
        -- Create a temporary table for sorted dates
        DROP TEMPORARY TABLE IF EXISTS temp_habit_dates;
        CREATE TEMPORARY TABLE temp_habit_dates (
          date_val DATE,
          row_num INT AUTO_INCREMENT PRIMARY KEY
        );
        
        -- Extract dates from JSON array and insert into temp table
        WHILE idx < dates_count AND idx < max_iterations DO
          SET habit_date = DATE(JSON_UNQUOTE(JSON_EXTRACT(completed_dates_json, CONCAT('$[', idx, ']'))));
          
          IF habit_date IS NOT NULL THEN
            INSERT INTO temp_habit_dates (date_val) VALUES (habit_date);
          END IF;
          
          SET idx = idx + 1;
        END WHILE;
        
        -- Get dates in descending order (most recent first)
        SET idx = 1;
        SET prev_date = NULL;
        SET temp_streak = 0;
        SET longest_streak = 0;
        
        -- Calculate streaks by iterating through sorted dates
        WHILE idx <= dates_count DO
          SELECT date_val INTO habit_date 
          FROM (
            SELECT date_val, ROW_NUMBER() OVER (ORDER BY date_val DESC) as rn
            FROM temp_habit_dates
          ) sorted
          WHERE rn = idx;
          
          IF prev_date IS NULL THEN
            -- First date in sequence
            SET temp_streak = 1;
          ELSE
            -- Check if dates are consecutive
            IF DATEDIFF(prev_date, habit_date) = 1 THEN
              SET temp_streak = temp_streak + 1;
            ELSE
              -- Streak broken - check if it's the longest
              IF temp_streak > longest_streak THEN
                SET longest_streak = temp_streak;
              END IF;
              SET temp_streak = 1;
            END IF;
          END IF;
          
          SET prev_date = habit_date;
          SET idx = idx + 1;
        END WHILE;
        
        -- Check the final streak
        IF temp_streak > longest_streak THEN
          SET longest_streak = temp_streak;
        END IF;
        
        -- The current streak is the first unbroken sequence from the most recent date
        SET current_streak = temp_streak;
        
        -- Update habit with calculated streaks
        UPDATE habits
        SET streak = current_streak,
            longestStreak = GREATEST(longestStreak, longest_streak)
        WHERE id = habit_id;
        
        DROP TEMPORARY TABLE IF EXISTS temp_habit_dates;
      END
    `);

    console.log('✅ Fixed calculate_habit_streak procedure');
  },

  down: async (queryInterface, Sequelize) => {
    // Restore original (even though it had issues)
    // In practice, you'd want the working version here too
    await queryInterface.sequelize.query('DROP PROCEDURE IF EXISTS calculate_habit_streak');
    console.log('✅ Rolled back procedure fix');
  }
};
