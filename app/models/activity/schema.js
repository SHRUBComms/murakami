/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('activity', {
    action_id: {
      type: DataTypes.STRING(25),
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    member_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    tableName: 'activity'
  });
};
