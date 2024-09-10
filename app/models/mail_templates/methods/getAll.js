module.exports = (MailTemplates) => {
  return async () => {
    const templates = await MailTemplates.findAll({ order: [["short_description", "ASC"]] });
    const templatesObj = templates.reduce(
      (obj, item) => Object.assign(obj, { [item.mail_id]: item }),
      {}
    );
    return { templatesObj, templates };
  };
};
