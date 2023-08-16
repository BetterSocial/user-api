const {Model, DataTypes} = require('sequelize');

module.exports = (sequelize) => {
  class Log extends Model {}

  Log.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
      createdAt: {
        type: DataTypes.DATE,
        field: 'created_at',
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: 'updated_at',
        allowNull: false
      },
      deletedAt: {
        type: DataTypes.DATE,
        field: 'deleted_at',
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'Log',
      tableName: 'logs',
      underscored: true
    }
  );

  return Log;
};
