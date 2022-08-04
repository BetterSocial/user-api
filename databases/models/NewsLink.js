"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class NewsLink extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.DomainPage, { as: 'newsLinkDomain', foreignKey: 'domain_page_id', targetKey: 'domain_page_id'})
    }
  }
  NewsLink.init(
    {
      news_link_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      news_url: DataTypes.STRING ,
      domain_page_id: DataTypes.STRING,
      site_name: DataTypes.STRING,
      title: DataTypes.STRING,
      image: DataTypes.STRING,
      description: DataTypes.TEXT,
      url: DataTypes.STRING,
      keyword: DataTypes.STRING,
      author: DataTypes.STRING,
      created_article: DataTypes.INTEGER,
      createdAt: {
        type: DataTypes.DATE,
        field: "created_at",
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: "updated_at",
      },
      post_id: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "NewsLink",
      tableName: "news_link",
      timestamps: true,
    }
  );
  return NewsLink;
};
