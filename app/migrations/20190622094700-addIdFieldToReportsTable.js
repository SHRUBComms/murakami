module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("reports", "id", {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([queryInterface.removeColumn("reports", "id")]);
  },
};
