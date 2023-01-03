module.exports = (Carbon) => {
  return async () => {
    return Carbon.findAll({ order: [["trans_date", "ASC"]] });
  };
};
