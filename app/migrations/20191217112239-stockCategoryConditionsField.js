module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.renameColumn(
        "stock_categories",
        "needsCondition",
        "conditions"
      ),
      queryInterface.changeColumn("stock_categories", "conditions", {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      })
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.renameColumn(
        "stock_categories",
        "conditions",
        "needsCondition"
      ),
      queryInterface.changeColumn("stock_categories", "needsCondition", {
        type: Sequelize.INTEGER(4),
        allowNull: false,
        defaultValue: "0"
      })
    ]);
  }
};
