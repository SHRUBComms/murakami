module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("volunteer_roles", "dateUpdated", {
        type: Sequelize.DATE,
        allowNull: true
      })
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([queryInterface.removeColumn("volunteer_roles", "dateUpdated")]);
  }
};
