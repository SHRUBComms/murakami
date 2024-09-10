module.exports = (Mail, nodemailer, htmlToText, sanitizeHtml, cleaner) => {
  return async (to_name, to_address, subject, html) => {
    html = sanitizeHtml(html, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
    });

    const message = {
      html: html,
      from: "Murakami <membership@shrubcoop.org>",
      to: to_name + " <" + to_address + ">",
      subject: subject,
    };

    const transporter = nodemailer.createTransport(Mail.supportSmtpConfig);
    transporter.use("compile", htmlToText());
    return transporter.sendMail(message);
  };
};
