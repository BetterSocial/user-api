"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class VoteComments extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  VoteComments.init(
    {
      id: { type: DataTypes.UUID, primaryKey: true },
      comment_id: { type: DataTypes.UUID, allowNull: false },
      user_id: { type: DataTypes.UUID, allowNull: false },
      status: { type: DataTypes.ENUM("upvote", "downvote"), allowNull: false },
      createdAt: {
        type: DataTypes.DATE,
        field: "created_at",
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: "updated_at",
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "VoteComments",
      tableName: "vote_comments",
      timestamps: true,
    }
  );
  return VoteComments;
};
