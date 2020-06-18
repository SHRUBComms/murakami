var sanitizeHtml = require("sanitize-html");
var async = require("async");

module.exports = function() {
  return function(collection, organisations, members, callback) {
    if (members[collection.member_id]) {
      collection.collectedBy =
        members[collection.member_id].first_name +
        " " +
        members[collection.member_id].last_name;
    } else {
      collection.collectedBy = "Unknown";
    }

    if (!collection.note) {
      collection.note = "-";
    } else if (collection.note == "null") {
      collection.note = "-";
    } else {
      collection.note = sanitizeHtml(collection.note);
    }

    collection.amountPortion =
      collection.amount / collection.destination_organisations.length;

    if (organisations[collection.collection_organisation_id]) {
      collection.collectedFrom =
        organisations[collection.collection_organisation_id].name;
    } else {
      collection.collectedFrom = "Unknown";
    }

    collection.droppedOffTo = "";

    async.eachOf(
      collection.destination_organisations,
      function(organisation, index, callback) {
        if (
          index != 0 &&
          index != collection.destination_organisations.length
        ) {
          collection.droppedOffTo += ", ";
        }

        if (organisations[organisation]) {
          collection.droppedOffTo += organisations[organisation].name;
        } else {
          collection.droppedOffTo += "Unknown";
        }
        callback();
      },
      function() {
        callback(collection);
      }
    );
  };
};
