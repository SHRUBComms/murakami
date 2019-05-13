module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.renameTable(
        "fs_organisations",
        "food_collections_organisations"
      ),
      queryInterface.renameTable("login", "users"),
      queryInterface.renameTable("global_settings", "settings")
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.renameTable(
        "food_collections_organisations",
        "fs_organisations"
      ),
      queryInterface.renameTable("users", "login"),
      queryInterface.renameTable("settings", "global_settings")
    ]);
  }
};
