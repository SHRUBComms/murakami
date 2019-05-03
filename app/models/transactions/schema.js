/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('transactions', {
    transaction_id: {
      type: DataTypes.STRING(30),
      allowNull: false,
      primaryKey: true
    },
    till_id: {
      type: DataTypes.STRING(25),
      allowNull: true
    },
    user_id: {
      type: DataTypes.STRING(25),
      allowNull: false
    },
    member_id: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    tableName: 'transactions'
  });
};
