module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("stock_categories", "stockControl", {
        type: Sequelize.INTEGER(4),
        allowNull: false,
        defaultValue: "0",
      }),
      queryInterface.addColumn("stock_categories", "stockInfo", {
        type: Sequelize.JSON,
      }),
      queryInterface.removeColumn("stock_categories", "quantity"),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("stock_categories", "stockControl"),
      queryInterface.removeColumn("stock_categories", "stockInfo"),
      queryInterface.addColumn("stock_categories", "quantity", {
        type: Sequelize.INTEGER(11),
        allowNull: true,
      }),
    ]);
  },
};
