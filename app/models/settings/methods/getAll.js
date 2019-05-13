var async = require("async");

module.exports = function(Settings, sequelize, DataTypes) {
  return function(callback) {
    Settings.findAll({}).nodeify(function(err, settings) {
      settingsObj = {};
      async.each(
        settings,
        function(setting, callback) {
          settingsObj[setting.id] = setting.data;
          callback();
        },
        function() {
          callback(err, settingsObj);
        }
      );
    });
  };
};
