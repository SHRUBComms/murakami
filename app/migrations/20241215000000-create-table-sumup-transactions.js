module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.createTable('sumup_transactions', {
        amount: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false
        },
        currency: {
          type: Sequelize.STRING(3),
          allowNull: false
        },
        id: {
          type: Sequelize.STRING,
          allowNull: false,
          primaryKey: true,
          unique: true
        },
        installments_count: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        payment_type: {
          type: Sequelize.STRING,
          allowNull: false
        },
        status: {
          type: Sequelize.STRING,
          allowNull: false
        },
        timestamp: {
          type: Sequelize.DATE,
          allowNull: false
        },
        transaction_code: {
          type: Sequelize.STRING,
          allowNull: true
        },
        payout_plan: {
          type: Sequelize.STRING,
          allowNull: false
        },
        payouts_received: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        payouts_total: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        product_summary: {
          type: Sequelize.STRING,
          allowNull: true
        },
        card_type: {
          type: Sequelize.STRING,
          allowNull: false
        },
        client_transaction_id: {
          type: Sequelize.STRING,
          allowNull: true
        },
        transaction_id: {
          type: Sequelize.STRING,
          allowNull: false
        },
        type: {
          type: Sequelize.STRING,
          allowNull: false
        },
        user: {
          type: Sequelize.STRING,
          allowNull: false
        }
      }, {
        timestamps: false
      })
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.dropTable('sumup_transactions')
    ]);
  }
};
