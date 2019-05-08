var sanitizeHtml = require("sanitize-html");

module.exports = function() {
  return function(collection, members, callback) {
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

    callback(collection);
  };
};
