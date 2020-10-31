module.exports = (MailTemplates, sequelize, DataTypes) => {
  return async (mail) => {
    return MailTemplates.update(
      { active: mail.active, subject: mail.subject, markup: mail.markup },
      { where: { mail_id: mail.id } }
    );
  }
}
