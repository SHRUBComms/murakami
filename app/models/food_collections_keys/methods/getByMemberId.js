module.exports = function(FoodCollectionsKeys, sequelize, DataTypes) {
  return function(member_id, callback) {
    FoodCollectionsKeys.findOne({ where: { member_id: member_id } }).nodeify(
      callback
    );
  };
};
