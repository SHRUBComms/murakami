var async = require("async");

module.exports = function(MailTemplates, sequelize, DataTypes) {
  return function(callback) {
    MailTemplates.findAll({ order: [["mail_desc", "ASC"]] }).nodeify(function(
      err,
      templates
    ) {
      var templatesObj = {};
      async.each(
        templates,
        function(template, callback) {
          templatesObj[template.mail_id] = template;
          callback();
        },
        function() {
          callback(err, templates, templatesObj);
        }
      );
    });
  };
};
