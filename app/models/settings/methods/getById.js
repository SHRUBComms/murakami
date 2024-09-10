module.exports = (Settings, sequelize, DataTypes) => {
  return async (id) => {
    const setting = await Settings.findOne({ where: { id: id } });
    return setting;
  };
};
