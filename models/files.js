"use strict";

module.exports = function(sequelize, DataTypes) {
	var FILE = sequelize.define("FILE", {
		tableName: DataTypes.STRING,
		dbName: DataTypes.STRING,
		location: { type: DataTypes.STRING, allowNull: false, unique: true },
		known: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
	}, {
		classMethods: {
			associate: function(models){
				FILE.belongsTo(models.CLUSTER);
			}
		}
	});

	return FILE;
};