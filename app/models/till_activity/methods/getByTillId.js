module.exports = function(TillActivity, sequelize, DataTypes) {
  return function(till_id, callback) {
    TillActivity.findOne({
      where: { till_id: till_id },
      order: [["timestamp", "DESC"]]
    }).nodeify(function(err, lastAction) {
      if (lastAction) {
        callback(lastAction);
      } else {
        callback({ opening: 0 });
      }
    });
  };
};
