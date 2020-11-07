module.exports = (Mail, nodemailer, htmlToText, sanitizeHtml, cleaner) => {
	return async (from_name, from_address, subject, html) => {
    		html = sanitizeHtml(html, {
      			allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"])
    		});

    		const message = {
      			html: html,
      			from: "Murakami Support <membership@shrubcoop.org>",
      			to: "Ross Hudson <hello@rosshudson.co.uk>",
      			subject: subject
    		};

    		const transporter = nodemailer.createTransport(Mail.supportSmtpConfig);
    		transporter.use("compile", htmlToText());
    		return transporter.sendMail(message);
  	}
}
