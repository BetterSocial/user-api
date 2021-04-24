"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class PollingOption extends Model {
        static associate(models) {

        }
    }

    PollingOption.init({
        polling_option_id : { type : DataTypes.UUID, primaryKey : true},
        polling_id : { type : DataTypes.UUID, allowNull : false },
        option : { type : DataTypes.STRING, allowNull : false },
        counter : { type : DataTypes.BIGINT, allowNull : true},
        createdAt : { type: DataTypes.DATE, field: "created_at", allowNull: false},
        updatedAt : { type: DataTypes.DATE, field: "updated_at", allowNull: false},
    }, {
        sequelize,
        modelName : "PollingOption",
        tableName : "polling_option",
        underscored : true
    })

    return PollingOption
}