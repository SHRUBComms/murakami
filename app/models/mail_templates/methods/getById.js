module.exports = function(MailTemplates, sequelize, DataTypes) {
  return function(mail_id, callback) {
    MailTemplates.findOne({ where: { mail_id: mail_id } }).nodeify(function(
      err,
      template
    ) {
      callback(err, template);
    });
  };
};
