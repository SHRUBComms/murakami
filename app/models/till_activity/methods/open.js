module.exports = function(TillActivity, sequelize, DataTypes) {
  return function(till_id, counted_float, user_id, note, callback) {
    TillActivity.generateId(function(id) {
      TillActivity.create({
        action_id: id,
        till_id: till_id,
        user_id: user_id,
        timestamp: new Date(),
        expected_float: null,
        counted_float: counted_float,
        opening: 1,
        note: note || null
      }).nodeify(callback);
    });
  };
};
