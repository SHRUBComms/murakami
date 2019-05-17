// /recover

var router = require("express").Router();
var moment = require("moment");
moment.locale("en-gb");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");

var Users = Models.Users;
var PasswordReset = Models.PasswordReset;
var Settings = Models.Settings;

var Mail = require(rootDir + "/app/configs/mail");

router.get("/", function(req, res) {
  Settings.getAll(function(err, settings) {
    if (settings.passwordReset == true) {
      res.render("recover", {
        title: "Account Recovery"
      });
    } else {
      res.redirect(process.env.PUBLIC_ADDRESS + "/");
    }
  });
});

router.post("/", function(req, res) {
  Settings.getAll(function(err, settings) {
    if (settings.passwordReset == true) {
      var email = req.body.email.trim();
      req.checkBody("email", "Please enter your email address").notEmpty();

      req
        .asyncValidationErrors()
        .then(function() {
          Users.getByUsernameOrEmail(email, function(err, user) {
            if (!err && user && user.deactivated == 0) {
              PasswordReset.findAll({
                where: {
                  used: 0,
                  user_id: user.id,
                  date_issued: {
                    [Models.Sequelize.Op.gte]: moment()
                      .subtract(60, "minutes")
                      .toDate()
                  }
                }
              }).nodeify(function(err, resets) {
                if (!resets[0]) {
                  PasswordReset.addPasswordReset(
                    user.id,
                    req.headers["x-forwarded-for"] ||
                      req.connection.remoteAddress,
                    function(err, reset_code) {
                      if (!err) {
                        if (err) {
                          req.flash("error_msg", "Something went wrong!");
                          res.redirect(process.env.PUBLIC_ADDRESS + "/recover");
                        } else {
                          var name = user.first_name + " " + user.last_name;
                          var email = user.email;
                          var subject = "Account Recovery";
                          var html =
                            "<h1>Hey " +
                            user.first_name +
                            "!</h1>" +
                            "<p>Recover your account <a href='" +
                            process.env.PUBLIC_ADDRESS +
                            "/recover/" +
                            reset_code +
                            "'>here</a>. This link will expire in one hour.</p>" +
                            "<p>From Murakami</p>";
                          Mail.sendUsers(name, email, subject, html, function(
                            err
                          ) {
                            if (err) {
                              req.flash(
                                "error_msg",
                                'Something went wrong sending you your recovery link, please <a href="' +
                                  process.env.PUBLIC_ADDRESS +
                                  '/support">contact support</a>'
                              );
                              res.redirect(
                                process.env.PUBLIC_ADDRESS + "/recover"
                              );
                            } else {
                              req.flash(
                                "success_msg",
                                "An email with recovery instructions has been sent!"
                              );
                              res.redirect(
                                process.env.PUBLIC_ADDRESS + "/recover"
                              );
                            }
                          });
                        }
                      } else {
                        req.flash("error_msg", "Something went wrong!");
                        res.redirect(process.env.PUBLIC_ADDRESS + "/recover");
                      }
                    }
                  );
                } else {
                  req.flash(
                    "error_msg",
                    "Account recovery process has already been initiated for this user!"
                  );
                  res.redirect(process.env.PUBLIC_ADDRESS + "/recover");
                }
              });
            } else {
              req.flash("error_msg", "Couldn't find that user!");
              res.redirect(process.env.PUBLIC_ADDRESS + "/recover");
            }
          });
        })
        .catch(function(errors) {
          Settings.getAll(function(err, settings) {
            res.render("recover", {
              layout: "login-layout",
              errors: errors,
              settings: settings
            });
          });
        });
    } else {
      res.redirect(process.env.PUBLIC_ADDRESS + "/");
    }
  });
});

router.get("/:reset_code", function(req, res) {
  PasswordReset.findOne({
    where: {
      reset_code: req.params.reset_code,
      used: 0,
      date_issued: {
        [Models.Sequelize.Op.gte]: moment()
          .subtract(60, "minutes")
          .toDate()
      }
    }
  }).nodeify(function(err, reset) {
    if (!err && reset) {
      res.render("reset", {
        title: "Account Recovery",
        reset_code: req.params.reset_code
      });
    } else {
      res.redirect(process.env.PUBLIC_ADDRESS + "/");
    }
  });
});

router.post("/:reset_code", function(req, res) {
  var password = req.body.password;
  var passwordConfirm = req.body.passwordConfirm;

  PasswordReset.findOne({
    where: {
      reset_code: req.params.reset_code,
      used: 0,
      date_issued: {
        [Models.Sequelize.Op.gte]: moment()
          .subtract(60, "minutes")
          .toDate()
      }
    }
  }).nodeify(function(err, reset) {
    if (!err && reset) {
      Users.getById(
        reset.user_id,
        { permissions: { users: { name: true } } },
        function(err, user) {
          if (!err && user && user.deactivated == 0) {
            if (password) {
              if (
                password.match(
                  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/
                )
              ) {
                if (passwordConfirm) {
                  if (password == passwordConfirm) {
                    Users.updatePassword(user.id, password, function(err) {
                      if (!err) {
                        PasswordReset.update(
                          { used: 1 },
                          { where: { reset_code: reset.reset_code } }
                        ).nodeify(function(err) {
                          req.flash(
                            "success_msg",
                            "Password reset! You can now login."
                          );
                          res.redirect(process.env.PUBLIC_ADDRESS + "/login");
                        });
                      } else {
                        req.flash(
                          "error",
                          "Something went wrong! Please try again."
                        );
                        res.redirect(
                          process.env.PUBLIC_ADDRESS +
                            "/recover/" +
                            req.params.reset_code
                        );
                      }
                    });
                  } else {
                    req.flash("error", "Passwords don't match!");
                    res.redirect(
                      process.env.PUBLIC_ADDRESS +
                        "/recover/" +
                        req.params.reset_code
                    );
                  }
                } else {
                  req.flash("error", "Please confirm you password.");
                  res.redirect(
                    process.env.PUBLIC_ADDRESS +
                      "/recover/" +
                      req.params.reset_code
                  );
                }
              } else {
                req.flash("error", "Please enter a valid password.");
                res.redirect(
                  process.env.PUBLIC_ADDRESS +
                    "/recover/" +
                    req.params.reset_code
                );
              }
            } else {
              req.flash("error", "Please enter a password.");
              res.redirect(
                process.env.PUBLIC_ADDRESS + "/recover/" + req.params.reset_code
              );
            }
          } else {
            res.render("error", {
              title: "User Deactivated",
              specificError: {
                title: "User Deactivated",
                message:
                  "You can't reset your password due to your account being deactivated. If this in error, please <a href='" +
                  process.env.PUBLIC_ADDRESS +
                  "/support'>contcat support</a>."
              }
            });
          }
        }
      );
    } else {
      res.redirect(process.env.PUBLIC_ADDRESS + "/");
    }
  });
});

module.exports = router;
