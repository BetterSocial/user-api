'use strict';
const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DomainPage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }
  DomainPage.init(
    {
      domain_page_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true
      },
      domain_name: {type: DataTypes.STRING},
      logo: DataTypes.STRING,
      short_description: DataTypes.TEXT,
      createdAt: {
        type: DataTypes.DATE,
        field: 'created_at'
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: 'updated_at'
      },
      credder_score: DataTypes.INTEGER,
      credder_last_checked: DataTypes.DATE,
      status: DataTypes.BOOLEAN
    },
    {
      sequelize,
      modelName: 'DomainPage',
      tableName: 'domain_page',
      timestamps: true
    }
  );
  return DomainPage;
};
