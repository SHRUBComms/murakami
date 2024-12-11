module.exports = (Settings, sequelize, DataTypes) => {
  /**
   * Updates an existing setting or creates a new one if it doesn't exist.
   * @param {string} id - The ID of the setting.
   * @param {Object} data - The data to be saved in the setting.
   * @returns {Promise<Object>} A promise that resolves to an object with a success property.
   */
  return async (id, data) => {
    const success = await Settings.upsert({ id, data });
    return { success };
  };
};
