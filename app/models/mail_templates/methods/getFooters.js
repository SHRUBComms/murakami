var async = require("async");

module.exports = function(MailTemplates, sequelize, DataTypes) {
  return function(callback) {
    MailTemplates.findAll({
      where: { category: "footers" },
      raw: true
    }).nodeify(function(err, footers) {
      var footersObj = {};
      async.each(
        footers,
        function(footer, callback) {
          if (footer.mail_id == "footer") {
            footersObj.members = footer;
          }

          if (footer.mail_id == "generic-footer") {
            footersObj.generic = footer;
          }
          callback();
        },
        function() {
          callback(err, footersObj);
        }
      );
    });
  };
};
