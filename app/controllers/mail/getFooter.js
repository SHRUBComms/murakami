const moment = require("moment");
moment.locale("en-gb");

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const MailTemplates = Models.MailTemplates;

module.exports = async (member_id) => {
  const footers = await MailTemplates.getFooters();
  let footerTemplate;
  if (member_id) {
    footerTemplate = footers.members.markup;
  } else {
    footerTemplate = footers.generic.markup;
  }

  footerTemplate = footerTemplate.replace(new RegExp("\\|year\\|", "g"), new Date().getFullYear());

  if (member_id) {
    footerTemplate = footerTemplate.replace(
      new RegExp("\\|contact_preferences_link\\|", "g"),
      process.env.PUBLIC_ADDRESS + "/contact-preferences/" + member_id
    );
    footerTemplate = footerTemplate.replace(new RegExp("\\|membership_id\\|", "g"), member_id);
  }

  if (footers.members.active == 0 && member_id) {
    footerTemplate = "";
  }

  if (footers.generic.active == 0 && !member_id) {
    footerTemplate = "";
  }

  return footerTemplate;
};
