'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Campaigns', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      message: {
        type: Sequelize.TEXT
      },
      metadata: {
        type: Sequelize.TEXT
      },
      description: {
        type: Sequelize.STRING
      },
      allocated_msg_count: {
        type: Sequelize.INTEGER
      },
      scheduled_time: {
        type: Sequelize.INTEGER
      },
      last_run: {
        type: Sequelize.DATE
      },
      status: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Campaigns');
  }
};