module.exports = (Settings, sequelize, DataTypes) => {
  /**
   * Creates a new setting if it doesn't already exist.
   * @param {string} id - The ID of the setting.
   * @param {Object} data - The data to be saved in the setting.
   * @returns {Promise<Object>} A promise that resolves to the setting instance.
   */
  return async (id, data) => {
    const [setting, created] = await Settings.findOrCreate({
      where: { id: id },
      defaults: { id: id, data: data },
    });
    return setting;
  };
};
