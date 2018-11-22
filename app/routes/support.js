// /support

var router = require("express").Router();

var rootDir = process.env.CWD;

var Mail = require(rootDir + "/app/configs/mail");

router.get("/", function(req, res) {
  res.render("support", {
    layout: "login-layout",
    title: "Support"
  });
});

router.post("/", function(req, res) {
  var name = req.body.name;
  var email = req.body.email;
  var subject = req.body.subject;
  var message = req.body.message;

  // Validation
  req.checkBody("name", "Please enter a name").notEmpty();
  req
    .checkBody("name", "Please enter a shorter name (<= 50 characters)")
    .isLength({ max: 50 });

  req.checkBody("email", "Please enter an email address").notEmpty();
  req
    .checkBody(
      "email",
      "Please enter a shorter email address (<= 89 characters)"
    )
    .isLength({ max: 89 });
  req.checkBody("email", "Please enter a valid email address").isEmail();

  req.checkBody("subject", "Please enter a subject line").notEmpty();
  req
    .checkBody(
      "subject",
      "Please enter a shorter subject line (<= 100 characters)"
    )
    .isLength({ max: 100 });

  req.checkBody("message", "Please enter a message").notEmpty();
  req
    .checkBody(
      "message",
      "Please enter a shorter message (<= 10000 characters)"
    )
    .isLength({ max: 10000 });

  // Parse request's body
  var errors = req.validationErrors();
  if (errors) {
    res.render("support", {
      layout: "login-layout",
      title: "Support",
      errors: errors,
      name: name,
      email: email,
      subject: subject,
      message: message
    });
  } else {
    message =
      "Name: " + name + "<br />" + "Email: " + email + "<br /><br />" + message;
    Mail.sendSupport(name, email, subject, message, function(err) {
      if (err) {
        req.flash("error_msg", "Something went wrong! Please try again");
        res.render("support", {
          layout: "login-layout",
          title: "Support",
          name: name,
          email: email,
          subject: subject,
          message: message
        });
      } else {
        req.flash("success_msg", "Message sent!");
        res.redirect("/support");
      }
    });
  }
});

module.exports = router;
