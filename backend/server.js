require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
// Using Sequelize for MySQL
const { Op } = require('sequelize');
const db = require('./models');
const { sequelize, User, Habit, Avatar } = db;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const cron = require('node-cron');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');

const app = express();
const PORT = process.env.PORT || 2000;


app.use(helmet()); 
app.use(xss());
// (mongoSanitize removed - not needed for SQL)
app.use(cors()); 
app.use(bodyParser.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// MySQL / Sequelize will be initialized below
const JWT_SECRET = process.env.JWT_SECRET;

// Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Verify email configuration on startup
    transporter.verify((error, success) => {
      if (error) {
        console.error('❌ Email configuration error:', error.message);
        console.error('Please check your EMAIL_USER and EMAIL_PASS in .env file');
        console.error('For Gmail, you need an App Password: https://myaccount.google.com/apppasswords');
      } else {
        console.log('✅ Email server is ready to send messages');
      }
    });

async function run() {
  try {
      await sequelize.authenticate();
      console.log('Connected to MySQL via Sequelize!');

      // In development, sync models to DB if needed
      if (process.env.NODE_ENV !== 'production') {
        await sequelize.sync();
      }

      // User Registration
      app.post('/register', async (req, res) => {
          const { email, password } = req.body;
          if (!email || !password) {
              return res.status(400).send({ error: 'Email and password are required.' });
          }
          const userExists = await User.findOne({ where: { email } });
          if (userExists) {
              return res.status(400).send({ error: 'User already exists. Try logging in.' });
          }
          const hashedPassword = await bcrypt.hash(password, 14);
          const user = await User.create({ email, password: hashedPassword });
          res.status(201).send({ message: 'User registered successfully.' });
      });

      // User Login
      app.post('/login', async (req, res) => {
          const { email, password } = req.body;
          const user = await User.findOne({ where: { email } });
          if (!user || !(await bcrypt.compare(password, user.password))) {
              return res.status(401).send({ error: 'Invalid email or password.' });
          }
          const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
          res.send({ token });
      });

      // CSRF Token Endpoint (for frontend) - Currently disabled, enable with csurf middleware if needed
      // app.get('/csrf-token', (req, res) => {
      //     res.json({ csrfToken: req.csrfToken() });
      // });
    // Password Reset Request
    app.post('/forgot-password', async (req, res) => {
      const { email } = req.body;

      try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
          return res.status(404).json({ error: 'User not found.' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const resetToken = {
          token,
          expires: Date.now() + 3600000, // 1 hour
        };

        await User.update(
          { resetToken: resetToken.token, resetTokenExpires: new Date(resetToken.expires) },
          { where: { email } }
        );

        const resetLink = `http://localhost:3000/reset-password?token=${token}&id=${user.id}`;
        await transporter.sendMail({
          to: user.email,
          subject: 'Password Reset',
          html: `<p>Click <a href="${resetLink}">here</a> to reset your password</p>`,
        });

        res.json({ message: 'Password reset email sent.' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to send password reset email.', details: error.message });
      }
    });

    // Password Reset
    app.post('/reset-password', async (req, res) => {
      try {
        const { token, id, newPassword } = req.body;

        const user = await User.findByPk(id);
        if (!user || user.resetToken !== token || !user.resetTokenExpires || new Date(user.resetTokenExpires) < new Date()) {
          return res.status(400).send({ error: 'Invalid or expired token.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);
        await User.update({ password: hashedPassword, resetToken: null, resetTokenExpires: null }, { where: { id: user.id } });

        res.status(200).send({ message: 'Password reset successfully.' });
      } catch (err) {
        res.status(500).send({ error: 'Failed to reset password.', details: err.message });
      }
    });

    // Middleware to verify JWT
    const authenticateJWT = async (req, res, next) => {
      try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) return res.sendStatus(401);

        let payload;
        try {
          payload = jwt.verify(token, JWT_SECRET);
        } catch (err) {
          return res.sendStatus(403);
        }

        // Ensure the user exists in the SQL DB
        const userRecord = await User.findByPk(payload.id);
        if (!userRecord) return res.status(401).send({ error: 'User not found. Please login again.' });

        req.user = { id: userRecord.id };
        next();
      } catch (err) {
        console.error('authenticateJWT error:', err);
        res.sendStatus(500);
      }
    };

    // Habit creation endpoint
    app.post('/habits', authenticateJWT, async (req, res) => {
      try {
        const { name, frequencyDays, color, reminderTime, startDate } = req.body;
        if (!name || !frequencyDays) {
          return res.status(400).send({ error: 'Habit name and frequency days are required' });
        }
        // Store arrays as JSON strings
        const created = await Habit.create({ 
          name, 
          frequencyDays: JSON.stringify(frequencyDays), 
          color, 
          reminderTime, 
          completedDates: JSON.stringify([]), 
          userId: req.user.id, 
          startDate 
        });
        await scheduleReminders();
        
        // Return formatted response with parsed arrays and _id for MongoDB compatibility
        const response = created.toJSON();
        response.frequencyDays = JSON.parse(response.frequencyDays || '[]');
        response.completedDates = JSON.parse(response.completedDates || '[]');
        response._id = response.id.toString();
        res.status(201).send(response);
      } catch (err) {
        res.status(500).send({ error: 'Failed to create habit', details: err.message });
      }
    });

    // Fetch habits for logged-in user
    app.get('/habits', authenticateJWT, async (req, res) => {
      try {
        const habits = await Habit.findAll({ where: { userId: req.user.id } });
        const mapped = habits.map(h => {
          const obj = h.toJSON();
          obj.completedDates = JSON.parse(obj.completedDates || '[]');
          obj.frequencyDays = JSON.parse(obj.frequencyDays || '[]');
          obj._id = obj.id.toString();
          return obj;
        });
        res.status(200).send(mapped);
      } catch (err) {
        res.status(500).send({ error: 'Failed to fetch habits', details: err.message });
      }
    });

    // Get user statistics using stored procedure
    app.get('/habits/stats/summary', authenticateJWT, async (req, res) => {
      try {
        const [results] = await sequelize.query(
          'CALL get_user_stats(:userId)',
          {
            replacements: { userId: req.user.id }
          }
        );
        res.status(200).send(results[0] || {
          total_habits: 0,
          habits_with_completions: 0,
          total_current_streak: 0,
          best_streak: 0,
          total_completions: 0
        });
      } catch (err) {
        res.status(500).send({ error: 'Failed to fetch stats', details: err.message });
      }
    });

    // Get Habit by ID
    app.get('/habits/:id', authenticateJWT, async (req, res) => {
      try {
        const { id } = req.params;
        const habit = await Habit.findOne({ where: { id, userId: req.user.id } });
        if (!habit) {
          return res.status(404).send({ error: 'Habit not found' });
        }
        const obj = habit.toJSON();
        obj.completedDates = JSON.parse(obj.completedDates || '[]');
        obj.frequencyDays = JSON.parse(obj.frequencyDays || '[]');
        obj._id = obj.id.toString();
        res.status(200).json(obj);
      } catch (err) {
        res.status(500).send({ error: 'Failed to fetch habit', details: err.message });
      }
    });

    // Mark habit as completed
    app.post('/habits/:id/complete', authenticateJWT, async (req, res) => {
      try {
        const { id } = req.params;
        const { date } = req.body;
        
        console.log('Complete habit request:', { habitId: id, date, userId: req.user.id });
        
        // Validate that the date is today (using local date to avoid timezone issues)
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const today = `${year}-${month}-${day}`;
        console.log('Server today (local):', today);
        
        if (date !== today) {
          console.log('Date mismatch! Received:', date, 'Expected:', today);
          return res.status(400).send({ 
            error: 'Invalid date',
            message: 'You can only complete habits for today'
          });
        }
        
        const habit = await Habit.findOne({ where: { id, userId: req.user.id } });
        if (!habit) {
          console.log('Habit not found for id:', id);
          return res.status(404).send({ error: 'Habit not found' });
        }
        
        console.log('Found habit:', habit.name);
        const completedDates = JSON.parse(habit.completedDates || '[]');
        console.log('Current completed dates:', completedDates);
        
        if (!completedDates.includes(date)) {
          completedDates.push(date);
          console.log('Added date, new array:', completedDates);
        } else {
          console.log('Date already in array');
        }
        
        // Update habit
        console.log('Updating habit with dates:', JSON.stringify(completedDates));
        await Habit.update({ completedDates: JSON.stringify(completedDates) }, { where: { id: habit.id } });
        
        // Calculate streak using stored procedure
        await sequelize.query('CALL calculate_habit_streak(:habitId)', {
          replacements: { habitId: id }
        });
        
        // Fetch updated habit with new streak info
        const updatedHabit = await Habit.findByPk(id);
        const obj = updatedHabit.toJSON();
        obj.completedDates = JSON.parse(obj.completedDates || '[]');
        obj.frequencyDays = JSON.parse(obj.frequencyDays || '[]');
        obj._id = obj.id.toString();
        
        console.log('✅ Habit completed successfully! New completed dates:', obj.completedDates);
        
        res.status(200).send({ 
          message: 'Habit marked as completed',
          habit: obj
        });
      } catch (err) {
        console.error('❌ Error completing habit:', err);
        res.status(500).send({ error: 'Failed to update habit', details: err.message });
      }
    });

    // Mark habit as incomplete
    app.post('/habits/:id/incomplete', authenticateJWT, async (req, res) => {
      try {
        const { id } = req.params;
        const { date } = req.body;
        
        console.log('Incomplete habit request:', { habitId: id, date, userId: req.user.id });
        
        // Validate that the date is today (using local date to avoid timezone issues)
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const today = `${year}-${month}-${day}`;
        console.log('Server today (local):', today);
        
        if (date !== today) {
          console.log('Date mismatch! Received:', date, 'Expected:', today);
          return res.status(400).send({ 
            error: 'Invalid date',
            message: 'You can only uncomplete habits for today'
          });
        }
        
        const habit = await Habit.findOne({ where: { id, userId: req.user.id } });
        if (!habit) {
          return res.status(404).send({ error: 'Habit not found' });
        }
        const completedDates = JSON.parse(habit.completedDates || '[]');
        const index = completedDates.indexOf(date);
        if (index > -1) {
          completedDates.splice(index, 1);
        }
        
        // Update habit
        await Habit.update({ completedDates: JSON.stringify(completedDates) }, { where: { id: habit.id } });
        
        // Recalculate streak using stored procedure
        await sequelize.query('CALL calculate_habit_streak(:habitId)', {
          replacements: { habitId: id }
        });
        
        // Fetch updated habit with new streak info
        const updatedHabit = await Habit.findByPk(id);
        const obj = updatedHabit.toJSON();
        obj.completedDates = JSON.parse(obj.completedDates || '[]');
        obj.frequencyDays = JSON.parse(obj.frequencyDays || '[]');
        obj._id = obj.id.toString();
        
        res.status(200).send({ 
          message: 'Habit marked as incomplete',
          habit: obj
        });
      } catch (err) {
        res.status(500).send({ error: 'Failed to update habit', details: err.message });
      }
    });

    // Helper functions for streak calculations
    const calculateCurrentStreak = (completedDates) => {
      const dates = completedDates
        .map(date => new Date(date).setHours(0, 0, 0, 0))
        .sort((a, b) => b - a);
      let streak = 0;
      let today = new Date().setHours(0, 0, 0, 0);
    
      for (let date of dates) {
        if (date === today - streak * 86400000) {
          streak++;
        } else {
          break;
        }
      }
      return streak;
    };
    
    const calculateLongestStreak = (completedDates) => {
      if (completedDates.length === 0) return 0;
    
      const dates = completedDates
        .map(date => new Date(date).setHours(0, 0, 0, 0))
        .sort((a, b) => a - b);
    
      let longestStreak = 1;
      let currentStreak = 1;
    
      for (let i = 1; i < dates.length; i++) {
        if (dates[i] - dates[i - 1] === 86400000) {
          currentStreak++;
        } else if (dates[i] !== dates[i - 1]) {
          currentStreak = 1;
        }
        if (currentStreak > longestStreak) {
          longestStreak = currentStreak;
        }
      }
      return longestStreak;
    };

    // Add statistics endpoint
    app.get('/habits/:id/stats', authenticateJWT, async (req, res) => {
      try {
        const { id } = req.params;
        const habit = await Habit.findOne({ where: { id, userId: req.user.id } });
        if (!habit) {
          return res.status(404).send({ error: 'Habit not found' });
        }

        // Calculate statistics
        const startDate = habit.startDate ? new Date(habit.startDate) : new Date();
        const totalDays = Math.ceil((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const completedDatesArr = JSON.parse(habit.completedDates || '[]');
        const completedDays = completedDatesArr.length;
        const completionRate = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;
        const currentStreak = calculateCurrentStreak(completedDatesArr);
        const longestStreak = calculateLongestStreak(completedDatesArr);

        res.status(200).send({
          totalDays,
          completedDays,
          completionRate,
          currentStreak,
          longestStreak,
        });
      } catch (err) {
        res.status(500).send({ error: 'Failed to fetch habit statistics', details: err.message });
      }
    });

    // API endpoint to save avatar
    app.post('/avatar', authenticateJWT, async (req, res) => {
      console.log('Received avatar data:', req.body);
      try {
        const { color, accessory, shape } = req.body;
        const avatarData = { color, accessory, shape, userId: req.user.id };

        // Check if the user already has an avatar
        const existingAvatar = await Avatar.findOne({ where: { userId: req.user.id } });
        if (existingAvatar) {
          await Avatar.update(avatarData, { where: { userId: req.user.id } });
          res.status(200).send({ message: 'Avatar updated successfully' });
        } else {
          await Avatar.create(avatarData);
          res.status(201).send({ message: 'Avatar created successfully' });
        }
      } catch (err) {
        console.error('Error while saving avatar:', err);
        res.status(500).send({ error: 'Failed to save avatar', details: err.message });
      }
    });
  

    // Fetch avatar for logged-in user
    app.get('/avatar', authenticateJWT, async (req, res) => {
      try {
        const avatar = await Avatar.findOne({ where: { userId: req.user.id } });
        if (!avatar) {
          return res.status(404).send({ error: 'Avatar not found' });
        }
        res.status(200).send(avatar);
      } catch (error) {
        res.status(500).send({ error: 'Failed to fetch avatar', details: error.message });
      }
    });


    // Update habit endpoint
    app.put('/habits/:id', authenticateJWT, async (req, res) => {
      try {
        const { id } = req.params;
        const { name, frequencyDays, color, reminderTime } = req.body;
        const habit = await Habit.findOne({ where: { id, userId: req.user.id } });
        if (!habit) {
          return res.status(404).send({ error: 'Habit not found' });
        }
        const updatedFields = { name, color, reminderTime };
        if (typeof frequencyDays !== 'undefined') {
          updatedFields.frequencyDays = JSON.stringify(frequencyDays);
        }
        await Habit.update(updatedFields, { where: { id: habit.id } });
        await scheduleReminders();
        
        const updated = await Habit.findByPk(habit.id);
        const ret = updated.toJSON();
        ret.frequencyDays = JSON.parse(ret.frequencyDays || '[]');
        ret.completedDates = JSON.parse(ret.completedDates || '[]');
        ret._id = ret.id.toString();
        res.status(200).send(ret);
      } catch (err) {
        res.status(500).send({ error: 'Failed to update habit', details: err.message });
      }
    });

    // Delete habit endpoint
    app.delete('/habits/:id', authenticateJWT, async (req, res) => {
      try {
        const { id } = req.params;
        const result = await Habit.destroy({ where: { id, userId: req.user.id } });
        if (result === 0) {
          return res.status(404).send({ error: 'Habit not found' });
        }
        res.send({ message: 'Habit deleted successfully' });
      } catch (err) {
        res.status(500).send({ error: 'Failed to delete habit', details: err.message });
      }
    });

    // Store active cron jobs to prevent duplicates
    const activeCronJobs = new Map();

    const scheduleReminders = async () => {
      try {
        // Clear all existing cron jobs before rescheduling
        activeCronJobs.forEach((job) => {
          job.stop();
        });
        activeCronJobs.clear();

        // Fetch all habits with reminder times
        const habits = await Habit.findAll({ where: { reminderTime: { [Op.ne]: null } } });
        
        habits.forEach(habit => {
          if (!habit.reminderTime) return;
          
          const [hour, minute] = habit.reminderTime.split(':');
          if (hour === undefined || minute === undefined) {
            console.warn(`Invalid reminder time format for habit ${habit.id}: ${habit.reminderTime}`);
            return;
          }

          // Create a unique key for this habit's reminder
          const jobKey = `habit_${habit.id}`;
          
          // Schedule the cron job (runs daily at the specified time)
          const job = cron.schedule(`${minute} ${hour} * * *`, async () => {
            try {
              const user = await User.findByPk(habit.userId);
              if (user) {
                console.log(`Sending reminder for habit "${habit.name}" to ${user.email}`);
                await transporter.sendMail({
                  to: user.email,
                  subject: `Habit Reminder: ${habit.name}`,
                  html: `
                    <h2>Habit Reminder</h2>
                    <p>Hi there!</p>
                    <p>This is a reminder to complete your habit: <strong>${habit.name}</strong></p>
                    <p>Keep up the great work! 💪</p>
                  `,
                  text: `Reminder to complete your habit: ${habit.name}`,
                });
                console.log(`Reminder sent successfully for habit "${habit.name}"`);
              }
            } catch (error) {
              console.error(`Failed to send reminder for habit ${habit.id}:`, error.message);
            }
          });

          // Store the job so we can stop it later
          activeCronJobs.set(jobKey, job);
        });

        console.log(`Scheduled ${activeCronJobs.size} habit reminders`);
      } catch (error) {
        console.error('Error scheduling reminders:', error);
      }
    };

    // Call scheduleReminders function on server start
    scheduleReminders();

    // Test endpoint to manually send a reminder (useful for testing email configuration)
    app.post('/habits/:id/test-reminder', authenticateJWT, async (req, res) => {
      try {
        const { id } = req.params;
        const habit = await Habit.findOne({ where: { id, userId: req.user.id } });
        if (!habit) {
          return res.status(404).send({ error: 'Habit not found' });
        }

        const user = await User.findByPk(req.user.id);
        if (!user) {
          return res.status(404).send({ error: 'User not found' });
        }

        // Send test reminder email
        await transporter.sendMail({
          to: user.email,
          subject: `Test Reminder: ${habit.name}`,
          html: `
            <h2>Test Habit Reminder</h2>
            <p>Hi there!</p>
            <p>This is a test reminder for your habit: <strong>${habit.name}</strong></p>
            <p>If you received this email, your reminder system is working correctly! 💪</p>
          `,
          text: `Test reminder for your habit: ${habit.name}`,
        });

        res.status(200).send({ 
          message: 'Test reminder sent successfully',
          sentTo: user.email,
          habitName: habit.name
        });
      } catch (err) {
        console.error('Failed to send test reminder:', err);
        res.status(500).send({ 
          error: 'Failed to send test reminder', 
          details: err.message 
        });
      }
    });

    // Manual trigger to cleanup expired reset tokens
    app.post('/admin/cleanup-tokens', authenticateJWT, async (req, res) => {
      try {
        const [results] = await sequelize.query('CALL cleanup_expired_tokens()');
        res.status(200).send({ 
          message: 'Token cleanup completed',
          deletedCount: results[0]?.deleted_tokens || 0
        });
      } catch (err) {
        res.status(500).send({ 
          error: 'Failed to cleanup tokens', 
          details: err.message 
        });
      }
    });

    // Manual trigger to recalculate streak for a habit
    app.post('/habits/:id/recalculate-streak', authenticateJWT, async (req, res) => {
      try {
        const { id } = req.params;
        const habit = await Habit.findOne({ where: { id, userId: req.user.id } });
        if (!habit) {
          return res.status(404).send({ error: 'Habit not found' });
        }

        await sequelize.query('CALL calculate_habit_streak(:habitId)', {
          replacements: { habitId: id }
        });

        const updatedHabit = await Habit.findByPk(id);
        const obj = updatedHabit.toJSON();
        obj.completedDates = JSON.parse(obj.completedDates || '[]');
        obj.frequencyDays = JSON.parse(obj.frequencyDays || '[]');
        obj._id = obj.id.toString();

        res.status(200).send({ 
          message: 'Streak recalculated successfully',
          habit: obj
        });
      } catch (err) {
        res.status(500).send({ 
          error: 'Failed to recalculate streak', 
          details: err.message 
        });
      }
    });

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error initializing database or server:', error);
  }
}

// Run the server
run().catch(console.dir);
