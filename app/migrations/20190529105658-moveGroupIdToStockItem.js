module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("tills", "stockControl"),
      queryInterface.addColumn("stock_categories", "group_id", {
        type: Sequelize.STRING(12),
        allowNull: true
      }),
      queryInterface.addColumn("carbon", "fx_transaction_id", {
        type: Sequelize.STRING(30),
        allowNull: true
      })
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("tills", "stockControl", {
        type: Sequelize.INTEGER(4),
        allowNull: false,
        defaultValue: "0"
      }),
      queryInterface.removeColumn("stock_categories", "group_id"),
      queryInterface.removeColumn("carbon", "fx_transaction_id")
    ]);
  }
};
