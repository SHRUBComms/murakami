var async = require("async");

module.exports = function(Users, sequelize, DataTypes) {
  return function(user, callback) {
    Users.findAll({
      where: {
        class: {
          [DataTypes.Op.or]: ["staff", "admin"]
        }
      }
    }).nodeify(function(err, coordinators) {
      var kv = {};
      var flat = [];
      async.each(
        coordinators,
        function(coordinator, callback) {
          kv[coordinator.id] = coordinator;
          flat.push(coordinator.id);
          callback();
        },
        function() {
          callback(err, coordinators, kv, flat);
        }
      );
    });
  };
};
