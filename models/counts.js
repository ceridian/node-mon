"use strict";

module.exports = function(sequelize, DataTypes) {
	var COUNT = sequelize.define('COUNT', {
		dbName: DataTypes.STRING,
		tableName: DataTypes.STRING,
		count: DataTypes.INTEGER
	}, {
		classMethods: {
			associate: function(models){
				COUNT.belongsTo(models.CLUSTER);
			}
		}
	});
	return COUNT;
};