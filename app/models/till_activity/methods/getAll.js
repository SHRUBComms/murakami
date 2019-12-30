var async = require("async");

module.exports = function(TillActivity, sequelize, DataTypes) {
  return function(callback) {
    var query = `SELECT *
                FROM  till_activity t1
                WHERE timestamp = (SELECT MAX(timestamp) from till_activity t2 WHERE t1.till_id = t2.till_id)
                ORDER BY timestamp DESC`;
    sequelize.query(query).nodeify(function(err, activity) {
      activity = activity[0];
      var activityObj = {};
      async.each(
        activity,
        function(action, callback) {
          activityObj[action.till_id] = action;
          callback();
        },
        function() {
          callback(err, activityObj);
        }
      );
    });
  };
};
