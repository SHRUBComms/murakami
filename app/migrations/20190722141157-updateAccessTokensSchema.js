module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn("access_tokens", "timestamp", {
        type: Sequelize.DATE,
        allowNull: false,
      }),
      queryInterface.renameColumn("access_tokens", "timestamp", "expirationTimestamp"),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.renameColumn("access_tokens", "expirationTimestamp", "timestamp"),
      queryInterface.changeColumn("access_tokens", "timestamp", {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      }),
    ]);
  },
};
