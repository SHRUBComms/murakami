var async = require("async");

module.exports = function(carbon, carbonCategories, callback) {
  var totalCarbon = 0;
  async.each(
    carbon,
    function(transaction, callback) {
      transaction.trans_object = transaction.trans_object;
      async.eachOf(
        transaction.trans_object,
        function(savedInCarbonCategory, carbon_id, callback) {
          if (carbonCategories[carbon_id]) {
            totalCarbon +=
              savedInCarbonCategory *
              carbonCategories[carbon_id].factors[transaction.method];

            callback();
          } else {
            callback();
          }
        },
        function() {
          callback();
        }
      );
    },
    function() {
      callback(totalCarbon);
    }
  );
};
