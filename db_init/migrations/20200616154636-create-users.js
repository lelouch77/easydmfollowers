'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Users', {
      id_str: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      profile_image_url_https: {
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      screen_name: {
        type: Sequelize.STRING
      },
      location: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      },
      protected: {
        type: Sequelize.BOOLEAN
      },
      verified: {
        type: Sequelize.BOOLEAN
      },
      followers_count: {
        type: Sequelize.INTEGER
      },
      friends_count: {
        type: Sequelize.INTEGER
      },
      listed_count: {
        type: Sequelize.INTEGER
      },
      favourites_count: {
        type: Sequelize.INTEGER
      },
      statuses_count: {
        type: Sequelize.INTEGER
      },
      default_profile: {
        type: Sequelize.BOOLEAN
      },
      default_profile_image: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      status: {
        type: Sequelize.INTEGER
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Users');
  }
};