module.exports = (Settings, sequelize, DataTypes) => {
  return async () => {
    // Look for the setting identified by 'issue_tokens_enabled'
    const setting = await Settings.findOne({ where: { id: "issueTokensEnabled" } });
    if (!setting) {
      // If the setting is missing, default to true (tokens are issued)
      return true;
    }
    // Convert string value to boolean
    return setting.value === "true";
  };
};
