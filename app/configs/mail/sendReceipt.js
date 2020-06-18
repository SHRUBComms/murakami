var Handlebars = require("handlebars");
var fs = require("fs");
var moment = require("moment");
moment.locale("en-gb");

var rootDir = process.env.CWD;

var GetFooter = require("./getFooter");

var Models = require(rootDir + "/app/models/sequelize");
var MailTemplates = Models.MailTemplates;

module.exports = function(Mail, nodemailer, htmlToText, sanitizeHtml, cleaner) {
  return function(recipient, transaction, callback) {
    MailTemplates.getById("receipt", function(err, receiptTemplate) {
      var source = fs.readFileSync(
        rootDir + "/app/views/till/receipt/email.hbs",
        "utf-8"
      );

      // Create email generator
      var template = Handlebars.compile(source);
      var receiptComponent = template({
        year: moment().year(),
        public_address: process.env.PUBLIC_ADDRESS,
        recipient: recipient,
        transaction: transaction
      });

      var markup = receiptTemplate.markup;
      var regex = new RegExp("\\|receipt\\|", "g");
      markup = markup.replace(regex, receiptComponent);

      GetFooter(recipient.member_id, function(footer) {
        markup += "<hr />" + footer;
        var message = {
          html: markup,
          from: "SHRUB Coop <receipts@shrubcoop.org>",
          to: recipient.email,
          subject: "Your Receipt"
        };
        var transporter = nodemailer.createTransport(Mail.supportSmtpConfig);
        transporter.use("compile", htmlToText());
        transporter.sendMail(message, callback);
      });
    });
  };
};
