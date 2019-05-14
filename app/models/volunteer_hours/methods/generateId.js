module.exports = function(VolunteerHours, sequelize, DataTypes) {
  var Helpers = require(process.env.CWD + "/app/helper-functions/root");
  var GetId = function(callback) {
    var id = Helpers.generateIntId(11);

    VolunteerHours.findAll({ where: { shift_id: id } }).nodeify(function(
      err,
      result
    ) {
      if (result.length > 0) {
        GetId(callback);
      } else if (result.length == 0) {
        callback(id);
      }
    });
  };
  return GetId;
};
