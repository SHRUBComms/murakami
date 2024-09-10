module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("stock_categories", "discount", {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: 0,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([queryInterface.removeColumn("stock_categories", "discount")]);
  },
};
