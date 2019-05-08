module.exports = function(MailTemplates, sequelize, DataTypes) {
  return function(mail, callback) {
    MailTemplates.update(
      { active: mail.active, subject: mail.subject, markup: mail.markup },
      { where: { mail_id: mail.id } }
    ).nodeify(function(err) {
      callback(err);
    });
  };
};
