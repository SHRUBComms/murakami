var async = require("async");

module.exports = function(Settings, sequelize, DataTypes) {
  return function(callback) {
    Settings.findAll({
      where: {
        id: {
          [DataTypes.Op.or]: [
            "membershipBenefits",
            "saferSpacesPolicy",
            "volunteerAgreement",
            "ourVision",
            "privacyNotice"
          ]
        }
      }
    }).nodeify(function(err, settings) {
      async.each(
        settings,
        function(setting, callback) {
          setting.data = setting.data;
          callback();
        },
        function() {
          callback(err, settings);
        }
      );
    });
  };
};
