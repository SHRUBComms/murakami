var async = require("async");

module.exports = function(Tills, sequelize, DataTypes) {
  return function(callback) {
    Tills.findAll({}).nodeify(function(err, tills) {
      var tillsObj = {};
      async.each(
        tills,
        function(till, callback) {
          tillsObj[till.till_id] = till;
          callback();
        },
        function() {
          callback(err, tills, tillsObj);
        }
      );
    });
  };
};
