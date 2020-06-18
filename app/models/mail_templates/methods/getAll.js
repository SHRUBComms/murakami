var async = require("async");

module.exports = function(MailTemplates, sequelize, DataTypes) {
  return function(callback) {
    MailTemplates.findAll({ order: [["short_description", "ASC"]] }).nodeify(function(
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
