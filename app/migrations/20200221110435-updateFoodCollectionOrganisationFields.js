module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.renameColumn(
        "food_collections",
        "organisation_id",
        "collection_organisation_id"
      ),
      queryInterface.renameColumn(
        "food_collections",
        "destination_organisation_id",
        "destination_organisations"
      ),
      queryInterface.changeColumn(
        "food_collections",
        "destination_organisations",
        {
          type: Sequelize.JSON,
          allowNull: false
        }
      )
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.renameColumn(
        "food_collections",

        "collection_organisation_id",
        "organisation_id"
      ),
      queryInterface.renameColumn(
        "food_collections",

        "destination_organisations",
        "destination_organisation_id"
      ),
      queryInterface.changeColumn(
        "food_collections",
        "destination_organisations",
        {
          type: Sequelize.STRING(25),
          allowNull: false
        }
      )
    ]);
  }
};
