module.exports = (sequelize, DataTypes) => {
  const Habit = sequelize.define('Habit', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    frequencyDays: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '[]'
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reminderTime: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    completedDates: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '[]',
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }, {
    tableName: 'habits',
    timestamps: true,
  });

  return Habit;
};
