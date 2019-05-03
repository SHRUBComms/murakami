/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tills', {
    till_id: {
      type: DataTypes.STRING(25),
      allowNull: false,
      primaryKey: true
    },
    group_id: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    stockControl: {
      type: DataTypes.INTEGER(4),
      allowNull: false
    }
  }, {
    tableName: 'tills'
  });
};
