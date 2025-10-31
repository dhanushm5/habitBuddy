"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('habits', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      frequencyDays: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: '[]'
      },
      color: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      reminderTime: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      completedDates: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: '[]',
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('habits');
  }
};
