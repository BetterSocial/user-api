"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("location", {
      location_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      zip: {
        type: Sequelize.STRING,
      },
      neighborhood: {
        type: Sequelize.STRING,
      },
      city: {
        type: Sequelize.STRING,
      },
      state: {
        type: Sequelize.STRING,
      },
      country: {
        type: Sequelize.STRING,
      },
      location_level: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.STRING,
      },
      slug_name: {
        type: Sequelize.TEXT,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        field: 'created_at'
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        field: 'updated_at'
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("location");
  },
};
