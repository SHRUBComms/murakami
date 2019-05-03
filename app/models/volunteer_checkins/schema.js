/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('volunteer_checkins', {
    checkin_id: {
      type: DataTypes.STRING(25),
      allowNull: false,
      primaryKey: true
    },
    member_id: {
      type: DataTypes.STRING(11),
      allowNull: false
    },
    user_id: {
      type: DataTypes.STRING(11),
      allowNull: false
    },
    questionnaire: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    tableName: 'volunteer_checkins'
  });
};
