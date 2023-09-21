'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('UserBlockedDomains', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_blocked_domain_id: {
        type: Sequelize.STRING
      },
      user_id_blocker: {
        type: Sequelize.STRING
      },
      domain_page_id: {
        type: Sequelize.STRING
      },
      reason: {
        type: Sequelize.TEXT
      },
      reason_blocked: {
        type: Sequelize.TEXT
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
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('UserBlockedDomains');
  }
};
