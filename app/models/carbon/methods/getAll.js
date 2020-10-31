module.exports = (Carbon) => {
  return async () => {
    return Carbon.findAll({});
  };
};
