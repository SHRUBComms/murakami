module.exports = (Reports) => {
  return async () => {
    return Reports.findAll({ order: [["date", "asc"]] });
  };
};
