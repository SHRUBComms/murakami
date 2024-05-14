module.exports = (Settings, sequelize, DataTypes) => {
  return async (id, data) => {
    return Settings.update({ data: data }, { where: { id: id } });
  }
}
