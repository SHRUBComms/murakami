module.exports = (Mail, nodemailer, htmlToText, sanitizeHtml, cleaner) => {
  return async (to, subject, html) => {
    html = sanitizeHtml(html, { allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]) });

    const message = {
      html: html,
      from: "SHRUB Coop <membership@shrubcoop.org>",
      to: to,
      subject: subject,
    };

    const transporter = nodemailer.createTransport(Mail.supportSmtpConfig);
    transporter.use("compile", htmlToText());
    return transporter.sendMail(message);
  };
};
