module.exports = function(Mail, nodemailer, htmlToText, sanitizeHtml, cleaner) {
  return function(to_name, to_address, subject, html, callback) {
    html = sanitizeHtml(html, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"])
    });

    var message = {
      html: html,
      from: "Murakami <membership@shrubcoop.org>",
      to: to_name + " <" + to_address + ">",
      subject: subject
    };

    var transporter = nodemailer.createTransport(Mail.supportSmtpConfig);
    transporter.use("compile", htmlToText());
    transporter.sendMail(message, callback);
  };
};
