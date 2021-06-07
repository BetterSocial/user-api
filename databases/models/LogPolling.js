"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class LogPolling extends Model {
        static associate(models) {

        }
    }

    LogPolling.init({
        log_polling_id : { type : DataTypes.UUID, allowNull : false, primaryKey : true},
        polling_option_id : { type : DataTypes.UUID, allowNull : false},
        polling_id : { type : DataTypes.UUID, allowNull : false },
        user_id : { type : DataTypes.UUID, allowNull : false },
        createdAt : { type: DataTypes.DATE, field: "created_at", allowNull: false},
        updatedAt : { type: DataTypes.DATE, field: "updated_at", allowNull: false},
    }, {
        sequelize,
        modelName : "LogPolling",
        tableName : "log_polling",
        underscored : true
    })

    return LogPolling
}