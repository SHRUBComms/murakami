module.exports = (FoodCollectionsKeys, sequelize, DataTypes) => {
  return async (member_id) => {
    return FoodCollectionsKeys.findOne({ where: { member_id: member_id } });
  };
};
