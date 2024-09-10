module.exports = (MailTemplates, sequelize, DataTypes) => {
  return async (mail_id) => {
    return MailTemplates.findOne({ where: { mail_id: mail_id } });
  };
};
