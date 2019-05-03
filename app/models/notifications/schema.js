/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('notifications', {
    notification_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true
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
    title: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    tableName: 'notifications'
  });
};
