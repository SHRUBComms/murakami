module.exports = function(Users, sequelize, DataTypes) {
  var Helpers = require(process.env.CWD + "/app/helper-functions/root");
  var GetId = function(callback) {
    var id = Helpers.generateIntId(11);
    Users.findAll({ where: { id: id } }).nodeify(function(err, result) {
      if (result.length > 0) {
        GetId(callback);
      } else if (result.length == 0) {
        callback(id);
      }
    });
  };
  return GetId;
};
