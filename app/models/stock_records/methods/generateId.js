module.exports = (StockRecords, sequelize, DataTypes) => {
  const Helpers = require(process.env.CWD + "/app/helper-functions/root");
  const GetId = async () => {
    const id = Helpers.generateBase64Id(25);
    const result = await StockRecords.findAll({ where: { action_id: id } });
    if (result.length > 0) {
      GetId();
    } else if (result.length == 0) {
      return id;
    }
  };
  return GetId;
};
