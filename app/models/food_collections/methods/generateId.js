module.exports = (FoodCollections, sequelize, DataTypes) => {
  const Helpers = require(process.env.CWD + "/app/controllers/helper-functions/root");
  const GetId = async () => {
    const id = Helpers.generateBase64Id(15);
    const result = await FoodCollections.findAll({ where: { transaction_id: id } });

    if (result.length > 0) {
      GetId();
    } else if (result.length == 0) {
      return id;
    }
  };
  return GetId;
};
