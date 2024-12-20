require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const cron = require('node-cron');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');

const app = express();
const PORT = process.env.PORT;


app.use(helmet()); 
app.use(xss());
app.use(mongoSanitize()); 
app.use(cors()); 
app.use(bodyParser.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// MongoDB Connection URI
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});


const JWT_SECRET = process.env.JWT_SECRET;

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'Gmail', // Use Gmail or any other email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function run() {
  try {
      await client.connect();
      console.log('Connected to MongoDB!');
      const db = client.db('habit-tracker');
      const habitsCollection = db.collection('habits');
      const usersCollection = db.collection('users');
      const avatarsCollection = db.collection('avatars');

      // User Registration
      app.post('/register', async (req, res) => {
          const { email, password } = req.body;
          if (!email || !password) {
              return res.status(400).send({ error: 'Email and password are required.' });
          }
          const userExists = await usersCollection.findOne({ email });
          if (userExists) {
              return res.status(400).send({ error: 'User already exists. Try logging in.' });
          }
          const hashedPassword = await bcrypt.hash(password, 14); // Increased salt rounds for better security
          const user = { email, password: hashedPassword };
          await usersCollection.insertOne(user);
          res.status(201).send({ message: 'User registered successfully.' });
      });

      // User Login
      app.post('/login', async (req, res) => {
          const { email, password } = req.body;
          const user = await usersCollection.findOne({ email });
          if (!user || !(await bcrypt.compare(password, user.password))) {
              return res.status(401).send({ error: 'Invalid email or password.' });
          }
          const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
          res.send({ token });
      });

      // CSRF Token Endpoint (for frontend)
      app.get('/csrf-token', (req, res) => {
          res.json({ csrfToken: req.csrfToken() });
      });
    // Password Reset Request
    app.post('/forgot-password', async (req, res) => {
      const { email } = req.body;

      try {
        const user = await usersCollection.findOne({ email });
        if (!user) {
          return res.status(404).json({ error: 'User not found.' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const resetToken = {
          token,
          expires: Date.now() + 3600000, // 1 hour
        };

        await usersCollection.updateOne({ email }, { $set: { resetToken } });

        const resetLink = `http://localhost:3000/reset-password?token=${token}&id=${user._id}`;
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

        const user = await usersCollection.findOne({
          _id: new ObjectId(id),
          'resetToken.token': token,
          'resetToken.expires': { $gt: Date.now() },
        });

        if (!user) {
          return res.status(400).send({ error: 'Invalid or expired token.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);
        await usersCollection.updateOne(
          { _id: user._id },
          { $set: { password: hashedPassword, resetToken: null } }
        );

        res.status(200).send({ message: 'Password reset successfully.' });
      } catch (err) {
        res.status(500).send({ error: 'Failed to reset password.', details: err.message });
      }
    });

    // Middleware to verify JWT
    const authenticateJWT = (req, res, next) => {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        return res.sendStatus(401);
      }

      jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
          return res.sendStatus(403);
        }

        req.user = user;
        next();
      });
    };

    // Habit creation endpoint
    app.post('/habits', authenticateJWT, async (req, res) => {
      try {
        const { name, frequencyDays, color, reminderTime, startDate } = req.body;
        if (!name || !frequencyDays) {
          return res.status(400).send({ error: 'Habit name and frequency days are required' });
        }
        const habit = { name, frequencyDays, color, reminderTime, completedDates: [], userId: req.user.id, startDate};
        const result = await habitsCollection.insertOne(habit);
        await scheduleReminders(); // Schedule reminders after creating a habit
        res.status(201).send(result.ops[0]);
      } catch (err) {
        res.status(500).send({ error: 'Failed to create habit', details: err.message });
      }
    });

    // Fetch habits for logged-in user
    app.get('/habits', authenticateJWT, async (req, res) => {
      try {
        const habits = await habitsCollection.find({ userId: req.user.id }).toArray();
        res.status(200).send(habits);
      } catch (err) {
        res.status(500).send({ error: 'Failed to fetch habits', details: err.message });
      }
    });

    // Get Habit by ID
    app.get('/habits/:id', authenticateJWT, async (req, res) => {
      try {
        const { id } = req.params;
        const habit = await habitsCollection.findOne({
          _id: new ObjectId(id),
          userId: req.user.id, // Ensure the habit belongs to the authenticated user
        });
        if (!habit) {
          return res.status(404).send({ error: 'Habit not found' });
        }
        res.status(200).json(habit);
      } catch (err) {
        res.status(500).send({ error: 'Failed to fetch habit', details: err.message });
      }
    });

    // Mark habit as completed
    app.post('/habits/:id/complete', authenticateJWT, async (req, res) => {
      try {
        const { id } = req.params;
        const { date } = req.body;
        const habit = await habitsCollection.findOne({ _id: new ObjectId(id), userId: req.user.id });
        if (!habit) {
          return res.status(404).send({ error: 'Habit not found' });
        }
        const completedDates = habit.completedDates || [];
        if (!completedDates.includes(date)) {
          completedDates.push(date);
        }
        await habitsCollection.updateOne({ _id: new ObjectId(id) }, { $set: { completedDates } });
        res.status(200).send({ message: 'Habit marked as completed' });
      } catch (err) {
        res.status(500).send({ error: 'Failed to update habit', details: err.message });
      }
    });

    // Mark habit as incomplete
    app.post('/habits/:id/incomplete', authenticateJWT, async (req, res) => {
      try {
        const { id } = req.params;
        const { date } = req.body;
        const habit = await habitsCollection.findOne({ _id: new ObjectId(id), userId: req.user.id });
        if (!habit) {
          return res.status(404).send({ error: 'Habit not found' });
        }
        const completedDates = habit.completedDates || [];
        const index = completedDates.indexOf(date);
        if (index > -1) {
          completedDates.splice(index, 1);
        }
        await habitsCollection.updateOne({ _id: new ObjectId(id) }, { $set: { completedDates } });
        res.status(200).send({ message: 'Habit marked as incomplete' });
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
      const habit = await habitsCollection.findOne({ _id: new ObjectId(id), userId: req.user.id });
      if (!habit) {
        return res.status(404).send({ error: 'Habit not found' });
      }

      // Calculate statistics
      const totalDays = Math.ceil((Date.now() - new Date(habit.startDate).getTime()) / (1000 * 60 * 60 * 24));
      const completedDays = habit.completedDates.length;
      const completionRate = (completedDays / totalDays) * 100;
      const currentStreak = calculateCurrentStreak(habit.completedDates);
      const longestStreak = calculateLongestStreak(habit.completedDates);

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
      console.log('Received avatar data:', req.body); // Log the incoming data
      try {
          
          const { color, accessory, shape } = req.body;
          const avatarData = { color, accessory, shape, userId: req.user.id };

          // Check if the user already has an avatar
          const existingAvatar = await avatarsCollection.findOne({ userId: req.user.id });
          if (existingAvatar) {
              await avatarsCollection.updateOne(
                  { userId: req.user.id },
                  { $set: avatarData }
              );
              res.status(200).send({ message: 'Avatar updated successfully' });
          } else {
              await avatarsCollection.insertOne(avatarData);
              res.status(201).send({ message: 'Avatar created successfully' });
            }
      } catch (err) {
          console.error('Error while saving avatar:', err); // Log the error
          res.status(500).send({ error: 'Failed to save avatar', details: err.message });
        }
    });
  

    // Fetch avatar for logged-in user
    app.get('/avatar', authenticateJWT, async (req, res) => {
        try {
            const avatar = await avatarsCollection.findOne({ userId: req.user.id });
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
        const habit = await habitsCollection.findOne({ _id: new ObjectId(id), userId: req.user.id });
        if (!habit) {
          return res.status(404).send({ error: 'Habit not found' });
        }
        const updatedHabit = { name, frequencyDays, color, reminderTime };
        await habitsCollection.updateOne({ _id: new ObjectId(id) }, { $set: updatedHabit });
        await scheduleReminders(); // Schedule reminders after updating a habit
        res.status(200).send({ ...habit, ...updatedHabit });
      } catch (err) {
        res.status(500).send({ error: 'Failed to update habit', details: err.message });
      }
    });

    // Delete habit endpoint
    app.delete('/habits/:id', authenticateJWT, async (req, res) => {
      try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
          return res.status(400).send({ error: 'Invalid habit ID' });
        }
        const result = await habitsCollection.deleteOne({ _id: new ObjectId(id), userId: req.user.id });
        if (result.deletedCount === 0) {
          return res.status(404).send({ error: 'Habit not found' });
        }
        res.send({ message: 'Habit deleted successfully' });
      } catch (err) {
        res.status(500).send({ error: 'Failed to delete habit', details: err.message });
      }
    });

    const scheduleReminders = async () => {
      const habits = await habitsCollection.find({ reminderTime: { $exists: true, $ne: null } }).toArray();
      habits.forEach(habit => {
        const [hour, minute] = habit.reminderTime.split(':');
        if (hour !== undefined && minute !== undefined) {
          cron.schedule(`${minute} ${hour} * * *`, async () => {
            const user = await usersCollection.findOne({ _id: new ObjectId(habit.userId) });
            if (user) {
              await transporter.sendMail({
                to: user.email,
                subject: 'Habit Reminder',
                text: `Reminder to complete your habit: ${habit.name}`,
              });
            }
          });
        }
      });
    };

    // Call scheduleReminders function
    scheduleReminders();

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
  });
} catch (error) {
  console.error('Error connecting to MongoDB:', error);
}
}

// Run the server
run().catch(console.dir);
