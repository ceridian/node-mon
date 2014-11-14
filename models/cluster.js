"use strict";

module.exports = function(sequelize, DataTypes) {
	var CLUSTER = sequelize.define('CLUSTER', {
		name: DataTypes.STRING,
		ipAddr: DataTypes.STRING,
		hcatPort: DataTypes.INTEGER,
		hdfsPort: DataTypes.INTEGER,
		logPort: DataTypes.INTEGER
	}, {
		classMethods: {
			associate: function(models){
				CLUSTER.hasMany(models.CLUSTERUSER, {as: 'clusterID'});
				CLUSTER.hasMany(models.COUNT, {as: 'clusterID'});
				CLUSTER.hasMany(models.ALERT, {as: 'clusterID'});
				CLUSTER.hasMany(models.JOB, {as: 'clusterID'});
				CLUSTER.hasMany(models.FILE, {as: 'clusterID'});
			}
		}
	});
	return CLUSTER;
};