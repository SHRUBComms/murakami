module.exports = (FoodCollections, sequelize, DataTypes) => {
  return async () => {
    return FoodCollections.findAll({ where: { approved: null } });
  };
};
