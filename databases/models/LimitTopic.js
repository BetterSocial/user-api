'use strict';
const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LimitTopic extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  LimitTopic.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      limit: DataTypes.INTEGER,
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE
    },
    {
      sequelize,
      modelName: 'LimitTopics',
      tableName: 'limit_topics',
      timestamps: false,
      underscored: true
    }
  );
  return LimitTopic;
};
