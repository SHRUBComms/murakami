var async = require("async");

module.exports = function(Settings, sequelize, DataTypes) {
  return function(callback) {
    Settings.findAll({
      raw: true,
      where: {
        id: {
          [DataTypes.Op.or]: [
            "membershipBenefits",
            "saferSpacesPolicy",
            "volunteerAgreement",
            "ourVision",
            "privacyNotice",
            "activities",
            "commitmentLengths",
            "contactMethods",
            "locations"
          ]
        }
      }
    }).nodeify(function(err, settings) {
      var staticContent = { lists: {}, texts: {} };

      var validTexts = [
        "membershipBenefits",
        "saferSpacesPolicy",
        "volunteerAgreement",
        "ourVision",
        "privacyNotice"
      ];

      var validLists = [
        "activities",
        "commitmentLengths",
        "contactMethods",
        "locations"
      ];

      async.each(
        settings,
        function(setting, callback) {
          if (validTexts.includes(setting.id)) {
            staticContent.texts[setting.id] = setting;
          } else if (validLists.includes(setting.id)) {
            staticContent.lists[setting.id] = setting;
          }
          callback();
        },
        function() {
          callback(err, staticContent);
        }
      );
    });
  };
};
