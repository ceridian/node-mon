"use strict";

module.exports = function(sequelize, DataTypes) {
	var ALERT = sequelize.define('ALERT', {
		type: DataTypes.STRING,
		description: DataTypes.STRING,
		ackBy: DataTypes.STRING
	}, {
		classMethods: {
			associate: function(models){
				ALERT.belongsTo(models.CLUSTER);
			}
		}
	});
	return ALERT;
};