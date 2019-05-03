/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('till_activity', {
    action_id: {
      type: DataTypes.STRING(25),
      allowNull: false,
      primaryKey: true
    },
    till_id: {
      type: DataTypes.STRING(25),
      allowNull: false
    },
    user_id: {
      type: DataTypes.STRING(11),
      allowNull: false
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    expected_float: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    counted_float: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    opening: {
      type: DataTypes.INTEGER(4),
      allowNull: false
    }
  }, {
    tableName: 'till_activity'
  });
};
