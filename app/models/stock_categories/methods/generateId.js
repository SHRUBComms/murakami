module.exports = (StockCategories) => {
  const Helpers = require(process.env.CWD + "/app/helper-functions/root");
  const GetId = async () => {
    const id = Helpers.generateBase64Id(10);
    const result = await StockCategories.findAll({ where: { item_id: id } });

    if (result.length > 0) {
      GetId();
    } else if (result.length == 0) {
      return id;
    }
  }
  return GetId;
}
