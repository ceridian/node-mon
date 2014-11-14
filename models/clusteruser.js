"use strict";

module.exports = function(sequelize, DataTypes) {
	var CLUSTERUSER = sequelize.define('CLUSTERUSER', {
		userName: DataTypes.STRING,
		type: DataTypes.STRING
	}, {
		classMethods: {
			associate: function(models){
				CLUSTERUSER.belongsTo(models.CLUSTER);
			}
		}
	});
	return CLUSTERUSER;
};