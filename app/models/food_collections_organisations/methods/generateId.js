module.exports = function(FoodCollectionsOrganisations, sequelize, DataTypes) {
  var Helpers = require(process.env.CWD + "/app/helper-functions/root");
  var GetId = function(callback) {
    var id = Helpers.generateBase64Id(15);
    FoodCollectionsOrganisations.findAll({
      where: { organisation_id: id }
    }).nodeify(function(err, result) {
      if (result.length > 0) {
        GetId(callback);
      } else if (result.length == 0) {
        callback(id);
      }
    });
  };
  return GetId;
};
