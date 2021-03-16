"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("users", {
      user_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING,
      },
      human_id: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      country_code: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      real_name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      last_active_at: {
        type: Sequelize.DATE,
      },
      profile_pic_patch: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.BOOLEAN,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("users");
  },
};
