var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");
var MailTemplates = Models.MailTemplates;

module.exports = function(Mail, nodemailer, htmlToText, sanitizeHtml, cleaner) {
  return function(member, callback) {
    MailTemplates.getById("donation", function(err, mail) {
      MailTemplates.getById("footer", function(err, footer) {
        if (mail.active) {
          if (footer.active) {
            mail.markup += "<hr />" + footer.markup;
          }

          mail.markup = mail.markup
            .replace(/\|first_name\|/g, member.first_name)
            .replace(/\|tokens\|/g, member.tokens || 0)
            .replace(/\|balance\|/g, member.balance)
            .replace(/\|last_name\|/g, member.last_name)
            .replace(
              /\|fullname\|/g,
              member.first_name + " " + member.last_name
            )
            .replace(/\|exp_date\|/g, member.current_exp_membership)
            .replace(/\|membership_id\|/g, member.member_id);

          mail.markup = sanitizeHtml(mail.markup, {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"])
          });

          var message = {
            html: mail.markup,
            from: "SHRUB Coop <membership@shrubcoop.org>",
            to:
              member.first_name +
              " " +
              member.last_name +
              " <" +
              member.email +
              ">",
            subject: mail.subject
          };

          var transporter = nodemailer.createTransport(Mail.supportSmtpConfig);
          transporter.use("compile", htmlToText());
          transporter.sendMail(message, callback);
        } else {
          callback("Email template not active!", null);
        }
      });
    });
  };
};
