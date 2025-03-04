module.exports = {
  up: (queryInterface, DataTypes) => {
    return Promise.all([
      queryInterface.addColumn("stock_categories", "vat_category", {
        type: DataTypes.STRING(100),
        allowNull: true,
      }),
    ]);
  },

  down: (queryInterface) => {
    return Promise.all([queryInterface.removeColumn("stock_categories", "vat_category")]);
  },
};
