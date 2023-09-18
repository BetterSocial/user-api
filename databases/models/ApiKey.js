'use strict';
const {Model, DataTypes} = require('sequelize');
module.exports = (sequelize, DataTypess) => {
  class ApiKey extends Model {}

  ApiKey.init(
    {
      id: {type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true},
      key: {type: DataTypes.STRING, field: 'key'},
      createdAt: {type: DataTypes.DATE, field: 'created_at'},
      updatedAt: {type: DataTypes.DATE, field: 'updated_at'},
      deletedAt: {type: DataTypes.DATE, field: 'deleted_at'}
    },
    {
      sequelize,
      modelName: 'ApiKey',
      tableName: 'api_keys',
      underscored: true
    }
  );

  return ApiKey;
};
