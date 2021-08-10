"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserBlockedDomainHistory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UserBlockedDomainHistory.init(
    {
      user_blocked_domain_history_id: {
        type: DataTypes.UUID,
        primaryKey: true,
      },
      user_id_blocker: { type: DataTypes.UUID, allowNull: false },
      domain_page_id: DataTypes.BIGINT,
      action: DataTypes.STRING(5),
      source: DataTypes.STRING(50),
    },
    {
      sequelize,
      modelName: "UserBlockedDomainHistory",
      tableName: "user_blocked_domain_history",
      timestamps: false,
    }
  );
  return UserBlockedDomainHistory;
};
