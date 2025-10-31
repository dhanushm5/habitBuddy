const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const config = require('../config/config')[process.env.NODE_ENV || 'development'];

const sequelize = new Sequelize(config.database, config.username, config.password, config);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = require('./user')(sequelize, Sequelize);
db.Habit = require('./habit')(sequelize, Sequelize);
db.Avatar = require('./avatar')(sequelize, Sequelize);

// Associations
db.User.hasMany(db.Habit, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.Habit.belongsTo(db.User, { foreignKey: 'userId' });

db.User.hasOne(db.Avatar, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.Avatar.belongsTo(db.User, { foreignKey: 'userId' });

module.exports = db;
