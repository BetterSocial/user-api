'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('news_link', {
      news_link_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      news_url: {
        type: Sequelize.TEXT
      },
      domain_page_id: {
        type: Sequelize.BIGINT
      },
      site_name: {
        type: Sequelize.STRING
      },
      title: {
        type: Sequelize.STRING
      },
      image: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.TEXT
      },
      url: {
        type: Sequelize.TEXT
      },
      keyword: {
        type: Sequelize.STRING
      },
      author: {
        type: Sequelize.STRING
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('news_link');
  }
};
