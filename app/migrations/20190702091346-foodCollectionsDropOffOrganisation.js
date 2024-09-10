module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("food_collections", "destination_organisation_id", {
        type: Sequelize.STRING(15),
        allowNull: false,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("food_collections_organisations", "destination_organisation_id"),
    ]);
  },
};
