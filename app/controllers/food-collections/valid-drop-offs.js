var async = require("async");

module.exports = function(allOrganisations, dropOffOrganisations, callback) {
  var allValid = true;
  async.each(
    dropOffOrganisations,
    function(organisation_id, callback) {
      if (!allOrganisations[organisation_id]) {
        allValid = false;
        callback();
      } else {
        if (allOrganisations[organisation_id].active == 0) {
          allValid = false;
          callback();
        } else {
          if (!allOrganisations[organisation_id].type.includes("drop-offs")) {
            allValid = false;
            callback();
          } else {
            callback();
          }
        }
      }
    },
    function() {
      callback(allValid);
    }
  );
};
