var nodemailer = require("nodemailer");
var htmlToText = require('nodemailer-html-to-text').htmlToText;
var sanitizeHtml = require('sanitize-html');

var Members = require("../models/members");
var Settings = require("../models/settings")

var Mail = {};

if(process.env.NODE_ENV == "production") {
  Mail.memberSmtpConfig = {
      host: process.env.MAIL_HOST, 
      port: process.env.MAIL_PORT,
      secure: process.env.MAIL_SECURE_BOOL,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
  };
} else {
  Mail.memberSmtpConfig = {
      host: process.env.ETHEREAL_MAIL_HOST,
      port: process.env.ETHEREAL_MAIL_PORT,
      secure: process.env.ETHEREAL_MAIL_SECURE_BOOL,
      auth: {
          user: process.env.ETHEREAL_MAIL_USER,
          pass: process.env.ETHEREAL_MAIL_PASS
      }
  };
}

Mail.supportSmtpConfig = Mail.memberSmtpConfig;


Mail.sendSupport = function(from_name, from_address, subject, html, callback){
	html = sanitizeHtml(html);

  	var message = {
	  	html: html,
      	from: from_name + ' <' + from_address + '>',
      	to: 'Murakami Support <support@murakami.org.uk>',
      	subject: subject
  	}

  	var transporter = nodemailer.createTransport(Mail.supportSmtpConfig);
  	transporter.use('compile', htmlToText());
  	transporter.sendMail(message, callback);

}

Mail.sendAutomated = function(mail_id, member_id, callback){
	Members.getById(member_id, function(err, member){
    Settings.getAll(function(err, settings){
      settings = settings[0]
      settings.definitions = JSON.parse(settings.definitions)
      if(err || !member[0]) throw err;

      Members.makeNice(member[0], settings, function(member){
        Settings.getEmailTemplateById(mail_id, function(err, template){

          if(err || !template[0]) throw err;
          mail = template[0];

          if(mail.active){

            mail.markup = sanitizeHtml(mail.markup);
            mail.markup.replace("|first_name|", member.first_name.text)
                       .replace("|last_name|", member.last_name.text)
                       .replace("|fullname|", member.name.text)
                       .replace("|exp_date|", member.current_exp_membership.text.nice)
            var message = {
              html: mail.markup,
                from: 'Shrub Co-op <shrub@murakami.org.uk>',
                to: member.full_name.text + " <" + member.email.text + ">",
                subject: mail.subject
            }

            var transporter = nodemailer.createTransport(Mail.supportSmtpConfig);
            transporter.use('compile', htmlToText());
            transporter.sendMail(message, callback);
          } else {
            callback("Email template not active!", null)
          }
        });
      });      
    })

	});
}

Mail.sendUsers = function(to_name, to_address, subject, html, callback){
	html = sanitizeHtml(html);

  	var message = {
	  	html: html,
      	from: 'Murakami <support@murakami.org.uk>',
      	to: to_name + ' <' + to_address + '>',
      	subject: subject
  	}

  	var transporter = nodemailer.createTransport(Mail.supportSmtpConfig);
  	transporter.use('compile', htmlToText());
  	transporter.sendMail(message, callback);

}

Mail.sendGeneral = function(to, subject, html, callback){
	html = sanitizeHtml(html);

  	var message = {
	  	html: html,
      	from: 'Shrub Co-op <shrub@murakami.org.uk>',
      	to: to,
      	subject: subject
  	}

  	var transporter = nodemailer.createTransport(Mail.supportSmtpConfig);
  	transporter.use('compile', htmlToText());
  	transporter.sendMail(message, callback);	
}


module.exports = Mail;