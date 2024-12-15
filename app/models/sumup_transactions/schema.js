module.exports = function (sequelize, DataTypes) {
  const SumupTransactions = sequelize.define(
    "sumup_transactions",
    {
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      currency: {
        type: DataTypes.STRING(3),
        allowNull: false,
      },
      id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        unique: true,
      },
      installments_count: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      payment_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      transaction_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      payout_plan: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      payouts_received: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      payouts_total: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      product_summary: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      card_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      client_transaction_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      transaction_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      user: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: false,
      tableName: "sumup_transactions",
    }
  );

  return SumupTransactions;
};
