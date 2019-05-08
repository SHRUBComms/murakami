module.exports = function(WorkingGroups, sequelize, DataTypes) {
  var Helpers = require(process.env.CWD + "/app/configs/helpful_functions");
  var GetId = function(parent, callback) {
    if (parent) {
      id = parent + "-" + Helpers.generateIntId(3);
    } else {
      id = "WG-" + Helpers.generateIntId(3);
    }
    WorkingGroups.findAll({ where: { group_id: id } }).nodeify(function(
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
