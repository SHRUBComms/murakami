module.exports = function(Tills, sequelize, DataTypes) {
  return function(callback) {
    var query = `SELECT * FROM tills
                JOIN (SELECT name group_name, group_id FROM working_groups) AS groups ON tills.group_id = groups.group_id
                JOIN (SELECT till_id, opening, timestamp FROM till_activity AS activity
INNER JOIN (SELECT till_id activity_till_id, max(timestamp) max_timestamp
FROM till_activity
GROUP BY activity_till_id) AS activity2
ON activity2.max_timestamp = activity.timestamp AND activity2.activity_till_id = activity.till_id) AS till_activity ON till_activity.till_id=tills.till_id`;
    sequelize.query(query).nodeify(function(err, tills) {
      callback(err, tills[0]);
    });
  };
};
