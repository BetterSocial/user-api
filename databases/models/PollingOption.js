const {Model} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PollingOption extends Model {}

  PollingOption.init(
    {
      polling_option_id: {type: DataTypes.UUID, primaryKey: true},
      polling_id: {type: DataTypes.UUID, allowNull: false},
      option: {type: DataTypes.STRING, allowNull: false},
      counter: {type: DataTypes.BIGINT, allowNull: true}
    },
    {
      sequelize,
      modelName: 'PollingOption',
      tableName: 'polling_option',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      underscored: true
    }
  );

  return PollingOption;
};
