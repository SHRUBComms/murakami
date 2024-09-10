const fs = require("fs");
const nodemailer = require("nodemailer");
const htmlToText = require("nodemailer-html-to-text").htmlToText;
const sanitizeHtml = require("sanitize-html");
const cleaner = require("clean-html");

const rootDir = process.env.CWD;

const Mail = {};

if (process.env.NODE_ENV == "production") {
  Mail.memberSmtpConfig = {
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: JSON.parse(process.env.MAIL_SECURE_BOOL),
    auth: {
      type: "OAuth2",
      user: process.env.MAIL_USER,
      clientId: process.env.MAIL_CLIENT_ID,
      clientSecret: process.env.MAIL_CLIENT_SECRET,
      refreshToken: process.env.MAIL_REFRESH_TOKEN,
    },
  };
} else {
  Mail.memberSmtpConfig = {
    host: process.env.ETHEREAL_MAIL_HOST,
    port: process.env.ETHEREAL_MAIL_PORT,
    secure: JSON.parse(process.env.ETHEREAL_MAIL_SECURE_BOOL),
    auth: {
      user: process.env.ETHEREAL_MAIL_USER,
      pass: process.env.ETHEREAL_MAIL_PASS,
    },
  };
}

Mail.supportSmtpConfig = Mail.memberSmtpConfig;

fs.readdirSync(process.env.CWD + "/app/controllers/mail").forEach(function (functionName) {
  // Remove file format.
  functionName = functionName.split(".").slice(0, -1).join(".");

  if (!["root", "dynamicVariables.config", "getFooter"].includes(functionName)) {
    Mail[functionName] = require(process.env.CWD + "/app/controllers/mail/" + functionName)(
      Mail,
      nodemailer,
      htmlToText,
      sanitizeHtml,
      cleaner
    );
  }
});

module.exports = Mail;
