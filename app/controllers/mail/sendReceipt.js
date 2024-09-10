const Handlebars = require("handlebars");
const fs = require("fs");
const moment = require("moment");
moment.locale("en-gb");

const rootDir = process.env.CWD;

const GetFooter = require("./getFooter");

const Models = require(rootDir + "/app/models/sequelize");
const MailTemplates = Models.MailTemplates;

module.exports = (Mail, nodemailer, htmlToText, sanitizeHtml, cleaner) => {
  return async (recipient, transaction) => {
    try {
      const receiptTemplate = await MailTemplates.getById("receipt");
      const source = fs.readFileSync(rootDir + "/app/views/till/receipt/email.hbs", "utf-8");

      // Create email generator
      const template = Handlebars.compile(source);
      const receiptComponent = template({
        year: moment().year(),
        public_address: process.env.PUBLIC_ADDRESS,
        recipient: recipient,
        transaction: transaction,
      });

      let markup = receiptTemplate.markup;
      const regex = new RegExp("\\|receipt\\|", "g");
      markup = markup.replace(regex, receiptComponent);

      const footer = await GetFooter(recipient.member_id);
      markup += "<hr />" + footer;

      const message = {
        html: markup,
        from: "SHRUB Coop <receipts@shrubcoop.org>",
        to: recipient.email,
        subject: "Your Receipt",
      };

      const transporter = nodemailer.createTransport(Mail.supportSmtpConfig);
      transporter.use("compile", htmlToText());
      return transporter.sendMail(message);
    } catch (error) {
      throw error;
    }
  };
};
