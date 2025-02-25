module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.createTable('item_vat_categories', {
        item_vat_category_id: {
          type: Sequelize.STRING,
          allowNull: false,
          primaryKey: true,
          unique: true
        },
        item_id: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        group_id: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        vat_category: {
          type: Sequelize.STRING,
          allowNull: false,
        }
      }, {
        timestamps: false
      })
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.dropTable('item_vat_categories')
    ]);
  }
};
