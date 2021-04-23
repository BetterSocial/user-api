"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Polling extends Model {
        static associate(models) {

        }
    }

    Polling.init({
        polling_id : { type : DataTypes.UUID, allowNull : false, primaryKey : true},
        post_id : { type : DataTypes.UUID},
        question : { type : DataTypes.STRING, allowNull : true },
        user_id : { type : DataTypes.STRING, allowNull : false},
        flg_multiple : { type : DataTypes.BOOLEAN, allowNull : false, defaultValue : false},
        createdAt : { type: DataTypes.DATE, field: "created_at", allowNull: false},
        updatedAt : { type: DataTypes.DATE, field: "updated_at", allowNull: true},
    }, {
        sequelize,
        modelName : "Polling",
        tableName : "polling",
        underscored : true
    })

    return Polling
}