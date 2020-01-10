module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.createTable("stock_records", {
        action_id: {
          type: Sequelize.STRING(25),
          allowNull: false,
          primaryKey: true
        },
        item_id: {
          type: Sequelize.STRING(25),
          allowNull: false
        },
        till_id: {
          type: Sequelize.STRING(25),
          allowNull: false
        },
        user_id: {
          type: Sequelize.STRING(20),
          allowNull: false
        },
        timestamp: {
          type: Sequelize.DATE,
          allowNull: false
        },
        actionInfo: {
          type: Sequelize.JSON,
          allowNull: false
        }
      })
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.dropTable("stock_records")
    ]);
  }
};
