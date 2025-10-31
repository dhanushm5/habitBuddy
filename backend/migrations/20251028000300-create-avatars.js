"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('avatars', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      color: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      accessory: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      shape: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        unique: true
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
    await queryInterface.dropTable('avatars');
  }
};
