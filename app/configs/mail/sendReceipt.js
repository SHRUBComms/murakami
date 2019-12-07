var Handlebars = require("handlebars");
var fs = require("fs");
var moment = require("moment");
moment.locale("en-gb");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");
var MailTemplates = Models.MailTemplates;

module.exports = function(Mail, nodemailer, htmlToText, sanitizeHtml, cleaner) {
  return function(recipient, transaction, callback) {
    var source = fs.readFileSync(
      rootDir + "/app/views/partials/till/email-receipt.hbs",
      "utf-8"
    );
    // Create email generator
    var template = Handlebars.compile(source);
    var markup = template({
      year: moment().year(),
      public_address: process.env.PUBLIC_ADDRESS,
      recipient: recipient,
      transaction: transaction
    });

    var message = {
      html: markup,
      from: "SHRUB Coop <receipts@shrubcoop.org>",
      to: recipient.email,
      subject: "Your Receipt"
    };

    var transporter = nodemailer.createTransport(Mail.supportSmtpConfig);
    transporter.use("compile", htmlToText());
    transporter.sendMail(message, callback);
  };
};
