/* jshint indent: 2 */

var async = require("async");

module.exports = function(sequelize, DataTypes) {
  var Settings = sequelize.define(
    "settings",
    {
      id: {
        type: DataTypes.STRING(50),
        allowNull: false,
        primaryKey: true
      },
      data: {
        type: DataTypes.TEXT,
        allowNull: false
      }
    },
    {
      tableName: "settings",
      timestamps: false
    }
  );
  Settings.getAll = function(callback) {
    Settings.findAll({}).nodeify(function(err, settings) {
      settingsObj = {};
      async.each(
        settings,
        function(setting, callback) {
          settingsObj[setting.id] = JSON.parse(setting.data);
          callback();
        },
        function() {
          callback(err, settingsObj);
        }
      );
    });
  };

  return Settings;
};
