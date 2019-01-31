var nodemailer = require("nodemailer");
var htmlToText = require("nodemailer-html-to-text").htmlToText;
var sanitizeHtml = require("sanitize-html");
var moment = require("moment");
moment.locale("en-gb");

var Members = require("../models/members");
var Settings = require("../models/settings");
var WorkingGroups = require("../models/working-groups");

var Mail = {};

if (process.env.NODE_ENV == "production") {
  Mail.memberSmtpConfig = {
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: JSON.parse(process.env.MAIL_SECURE_BOOL),
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  };
} else {
  Mail.memberSmtpConfig = {
    host: process.env.ETHEREAL_MAIL_HOST,
    port: process.env.ETHEREAL_MAIL_PORT,
    secure: JSON.parse(process.env.ETHEREAL_MAIL_SECURE_BOOL),
    auth: {
      user: process.env.ETHEREAL_MAIL_USER,
      pass: process.env.ETHEREAL_MAIL_PASS
    }
  };
}

Mail.supportSmtpConfig = Mail.memberSmtpConfig;

Mail.sendSupport = function(from_name, from_address, subject, html, callback) {
  html = sanitizeHtml(html);

  var message = {
    html: html,
    from: "Murakami Support <support@murakami.org.uk>",
    to: "Ross Hudson <hello@rosshudson.co.uk>",
    subject: subject
  };

  var transporter = nodemailer.createTransport(Mail.supportSmtpConfig);
  transporter.use("compile", htmlToText());
  transporter.sendMail(message, callback);
};

Mail.sendAutomated = function(mail_id, member_id, callback) {
  Members.getById(member_id, { class: "admin" }, function(err, member) {
    Settings.getEmailTemplateById(mail_id, function(err, template) {
      if (err || !template[0]) throw err;
      mail = template[0];

      if (mail.active) {
        mail.markup = sanitizeHtml(mail.markup);

        mail.markup = mail.markup
          .replace("|first_name|", member.first_name)
          .replace("|last_name|", member.last_name)
          .replace("|fullname|", member.first_name + " " + member.last_name)
          .replace(
            "|exp_date|",
            moment(member.current_exp_membership).format("YYYY-MM-DD")
          )
          .replace("|membership_id|", member.member_id);

        var message = {
          html: mail.markup,
          from: "Shrub Co-op <shrub@murakami.org.uk>",
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

Mail.sendDonation = function(member, callback) {
  Settings.getEmailTemplateById("donation", function(err, template) {
    if (err || !template[0]) throw err;
    mail = template[0];

    if (mail.active) {
      mail.markup = sanitizeHtml(mail.markup);

      mail.markup = mail.markup
        .replace("|first_name|", member.first_name)
        .replace("|tokens|", member.tokens || 0)
        .replace("|balance|", member.balance)
        .replace("|last_name|", member.last_name)
        .replace("|fullname|", member.first_name + " " + member.last_name)
        .replace(
          "|exp_date|",
          moment(member.current_exp_membership).format("l")
        )
        .replace("|membership_id|", member.member_id);

      var message = {
        html: mail.markup,
        from: "Shrub Co-op <shrub@murakami.org.uk>",
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
};

Mail.sendUsers = function(to_name, to_address, subject, html, callback) {
  html = sanitizeHtml(html);

  var message = {
    html: html,
    from: "Murakami <support@murakami.org.uk>",
    to: to_name + " <" + to_address + ">",
    subject: subject
  };

  var transporter = nodemailer.createTransport(Mail.supportSmtpConfig);
  transporter.use("compile", htmlToText());
  transporter.sendMail(message, callback);
};

Mail.sendGeneral = function(to, subject, html, callback) {
  html = sanitizeHtml(html);

  var message = {
    html: html,
    from: "Shrub Co-op <shrub@murakami.org.uk>",
    to: to,
    subject: subject
  };

  var transporter = nodemailer.createTransport(Mail.supportSmtpConfig);
  transporter.use("compile", htmlToText());
  transporter.sendMail(message, callback);
};

module.exports = Mail;
