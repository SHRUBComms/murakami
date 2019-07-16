module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("food_collections_organisations", "type", {
        type: Sequelize.JSON,
        allowNull: false
      })
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("food_collections_organisations", "type")
    ]);
  }
};
