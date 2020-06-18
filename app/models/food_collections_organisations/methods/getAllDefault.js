var async = require("async");

module.exports = function(FoodCollectionsOrganisations, sequelize, DataTypes) {
  return function(callback) {
    FoodCollectionsOrganisations.findAll({
      where: { default: 1 },
      raw: true
    }).nodeify(function(err, organisations) {
      var organisationsObj = {};
      async.each(
        organisations,
        function(organisation, callback) {
          organisationsObj[organisation.organisation_id] = organisation;
          callback();
        },
        function() {
          callback(err, organisationsObj);
        }
      );
    });
  };
};
