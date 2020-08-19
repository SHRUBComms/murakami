module.exports = function(Reports, sequelize, DataTypes) {
  return function(callback) {
    Reports.findAll({
    	order: [
		["date","asc"]
	]
    })
    .nodeify(function(err, reports){
      callback(err, reports);
    });
  };
};
