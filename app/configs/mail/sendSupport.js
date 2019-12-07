module.exports = function(Mail, nodemailer, htmlToText, sanitizeHtml, cleaner) {
  return function(from_name, from_address, subject, html, callback) {
    html = sanitizeHtml(html, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"])
    });

    var message = {
      html: html,
      from: "Murakami Support <membership@shrubcoop.org>",
      to: "Ross Hudson <hello@rosshudson.co.uk>",
      subject: subject
    };

    var transporter = nodemailer.createTransport(Mail.supportSmtpConfig);
    transporter.use("compile", htmlToText());
    transporter.sendMail(message, callback);
  };
};
