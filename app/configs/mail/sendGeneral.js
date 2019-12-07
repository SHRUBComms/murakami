module.exports = function(Mail, nodemailer, htmlToText, sanitizeHtml, cleaner) {
  return function(to, subject, html, callback) {
    html = sanitizeHtml(html, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"])
    });

    var message = {
      html: html,
      from: "SHRUB Coop <membership@shrubcoop.org>",
      to: to,
      subject: subject
    };

    var transporter = nodemailer.createTransport(Mail.supportSmtpConfig);
    transporter.use("compile", htmlToText());
    transporter.sendMail(message, callback);
  };
};
