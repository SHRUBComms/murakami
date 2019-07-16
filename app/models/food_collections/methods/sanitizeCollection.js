var sanitizeHtml = require("sanitize-html");

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

    if (organisations[collection.organisation_id]) {
      collection.collectedFrom = organisations[collection.organisation_id].name;
    } else {
      collection.collectedFrom = "Unknown";
    }

    if (organisations[collection.destination_organisation_id]) {
      collection.droppedOffTo =
        organisations[collection.destination_organisation_id].name;
    } else {
      collection.droppedOffTo = "Unknown";
    }

    callback(collection);
  };
};
