"use strict";

module.exports = function(sequelize, DataTypes) {
	var JOB = sequelize.define('JOB', {
		type: DataTypes.STRING,
		statement: DataTypes.STRING,
		outDest: DataTypes.STRING,
		jobID: DataTypes.STRING,
		startDtTm: DataTypes.DATE,
		endDtTm: DataTypes.DATE
	}, {
		classMethods: {
			associate: function(models){
				JOB.belongsTo(models.CLUSTER);
			}
		}
	});
	return JOB;
};