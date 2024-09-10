module.exports = (Transactions) => {
  return async () => {
    return Transactions.findAll({
      order: [["date", "ASC"]],
    });
  };
};
