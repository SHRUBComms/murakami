module.exports = (Transactions) => {
  const Helpers = require(process.env.CWD + "/app/controllers/helper-functions/root");
  const GetId = async () => {
    const id = Helpers.generateIntId(8);
    const result = await Transactions.findAll({ where: { transaction_id: id } });
    if (result.length > 0) {
      GetId();
    } else if (result.length == 0) {
      return id;
    }
  }
  return GetId;
}
