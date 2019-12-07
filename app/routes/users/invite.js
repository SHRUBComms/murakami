// /users/invite

var router = require("express").Router();
var moment = require("moment");
moment.locale("en-gb");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");
var Users = Models.Users;
var AccessTokens = Models.AccessTokens;

var Auth = require(rootDir + "/app/configs/auth");
var Helpers = require(rootDir + "/app/helper-functions/root");
var Mail = require(rootDir + "/app/configs/mail/root");

router.get("/", Auth.isLoggedIn, Auth.canAccessPage("users", "add"), function(
  req,
  res
) {
  res.render("users/invite", {
    title: "Invite User",
    usersActive: true,
    callback: req.query.callback || null
  });
});

router.post("/", Auth.isLoggedIn, Auth.canAccessPage("users", "add"), function(
  req,
  res
) {
  var first_name = req.body.first_name.trim();
  var last_name = req.body.last_name.trim();
  var username = req.body.username.trim();
  var email = req.body.email.trim();
  var userClass = req.body.class;

  var working_groups = req.body.working_groups;
  var notification_preferences = req.body.notification_preferences;

  if (!Array.isArray(working_groups)) {
    working_groups = [working_groups];
  }

  var validClasses, validWorkingGroups;

  if (req.user.class == "admin") {
    validClasses = ["admin", "till", "volunteer", "staff"];
  } else if (req.user.class == "staff") {
    validClasses = ["till", "volunteer", "staff"];
  }

  if (req.user.permissions.users.add == true) {
    validWorkingGroups = req.user.allWorkingGroupsFlat;
  } else if (req.user.permissions.users.add == "commonWorkingGroup") {
    validWorkingGroups = req.user.working_groups;
  }

  if (!validClasses.includes(userClass)) {
    userClass = null;
  }

  // Validation
  if (username) {
    req
      .check(
        "username",
        "This username is already in use! Please enter something different"
      )
      .isUsernameAvailable();
  }
  if (email) {
    req
      .check(
        "email",
        "This email address is already in use! Please enter something different"
      )
      .isEmailAvailable();
  }

  req.checkBody("first_name", "Please enter a first name").notEmpty();
  req
    .checkBody(
      "first_name",
      "Please enter a shorter first name (<= 20 characters)"
    )
    .isLength({ max: 20 });

  req.checkBody("last_name", "Please enter a last name").notEmpty();
  req
    .checkBody(
      "last_name",
      "Please enter a shorter last name (<= 30 characters)"
    )
    .isLength({ max: 30 });

  req.checkBody("username", "Please enter a username").notEmpty();
  req
    .checkBody("username", "Please enter a shorter username (<= 20 characters)")
    .isLength({ max: 20 });
  req
    .checkBody("username", "Please enter a valid username")
    .matches(/^[A-Za-z0-9]+(?:[._-][A-Za-z0-9]+)*$/);

  req.checkBody("email", "Please enter an email address").notEmpty();
  req
    .checkBody(
      "email",
      "Please enter a shorter email address (<= 89 characters)"
    )
    .isLength({ max: 89 });
  req.checkBody("email", "Please enter a valid email address").isEmail();

  req
    .checkBody("working_groups", "Please select at least one working group")
    .notEmpty();

  if (!Helpers.allBelongTo(working_groups, validWorkingGroups)) {
    req
      .checkBody("placeholder", "Please select valid working groups")
      .notEmpty();
  }

  var sanitized_notification_preferences = {
    "pending-volunteer-hours": {
      email: "off",
      murakami: "off"
    },
    "volunteers-need-to-volunteer": {
      email: "off",
      murakami: "off"
    },
    "unfinished-roles": {
      email: "off",
      murakami: "off"
    }
  };

  req
    .asyncValidationErrors()
    .then(function() {
      var newUser = {
        id: null,
        first_name: first_name,
        last_name: last_name,
        username: username,
        email: email,
        class: userClass,
        working_groups: working_groups.sort(),
        notification_preferences: sanitized_notification_preferences
      };

      Users.add(newUser, function(err, userId) {
        if (!err && userId) {
          var expirationTimestamp = moment()
            .add(7, "days")
            .toDate();
          AccessTokens.createInvite(
            expirationTimestamp,
            {
              action: "add-user",
              invitedBy: req.user.id,
              user_id: userId
            },
            function(err, token) {
              if (!err && token) {
                var inviteLink =
                  process.env.PUBLIC_ADDRESS + "/users/invite/" + token;
                Mail.sendGeneral(
                  newUser.first_name +
                    " " +
                    newUser.last_name +
                    " <" +
                    newUser.email +
                    ">",
                  "Murakami Invite",
                  "<p>Hey " +
                    first_name +
                    ",</p>" +
                    "<p>You've been invited to Murakami by " +
                    req.user.first_name +
                    " " +
                    req.user.last_name +
                    "!</p>" +
                    "<p>Please follow the link below to complete your registration. It will expire at <b>" +
                    moment(expirationTimestamp).format("L hh:mm A") +
                    "</b>.</p>" +
                    "<p><a href='" +
                    inviteLink +
                    "'>" +
                    inviteLink +
                    "</a>" +
                    "</p>",
                  function(err) {
                    if (err) {
                      req.flash(
                        "error_msg",
                        "Something went wrong sending the email! Manually send the link " +
                          inviteLink
                      );
                      res.redirect(
                        process.env.PUBLIC_ADDRESS +
                          "/users/invite?callback=true"
                      );
                    } else {
                      req.flash("success_msg", "Invite sent successfully!");
                      res.redirect(
                        process.env.PUBLIC_ADDRESS +
                          "/users/invite?callback=true"
                      );
                    }
                  }
                );
              } else {
                res.render("users/invite", {
                  errors: [{ msg: "Something went wrong!" }],
                  title: "Invite User",
                  usersActive: true,
                  first_name: first_name,
                  last_name: last_name,
                  username: username,
                  email: email,
                  working_groups: working_groups,
                  class: userClass
                });
              }
            }
          );
        } else {
          res.render("users/invite", {
            errors: [{ msg: "Something went wrong!" }],
            title: "Invite User",
            usersActive: true,
            first_name: first_name,
            last_name: last_name,
            username: username,
            email: email,
            working_groups: working_groups,
            class: userClass
          });
        }
      });
    })
    .catch(function(errors) {
      res.render("users/invite", {
        errors: errors,
        title: "Invite User",
        usersActive: true,
        first_name: first_name,
        last_name: last_name,
        username: username,
        email: email,
        working_groups: working_groups,
        class: userClass
      });
    });
});

router.get("/:token", Auth.isNotLoggedIn, function(req, res) {
  AccessTokens.getById(req.params.token, function(err, invite) {
    if (!err && invite) {
      Users.getById(
        invite.details.user_id,
        { permissions: { users: { name: true } } },
        function(err, user) {
          if (
            !err &&
            user &&
            user.deactivated == 1 &&
            invite.details.action == "add-user"
          ) {
            if (invite.used == 0) {
              if (moment(invite.expirationTimestamp).isAfter(moment())) {
                res.render("reset", {
                  title: "Complete Registration",
                  invite: invite,
                  viewedUser: user
                });
              } else {
                res.render("error", {
                  title: "Invite Expired",
                  specificError: {
                    title: "Invalid Expired",
                    message: "This invite has expired!"
                  }
                });
              }
            } else {
              res.render("error", {
                title: "Invite Used",
                specificError: {
                  title: "Invalid Used",
                  message: "This invite has already been used!"
                }
              });
            }
          } else {
            res.render("error", {
              title: "Invalid Invite",
              specificError: {
                title: "Invalid Invite",
                message:
                  "Something went wrong when creating this invite. Please <a href='" +
                  process.env.PUBLIC_ADDRESS +
                  "/support'>contact support</a>."
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

router.post("/:token", Auth.isNotLoggedIn, function(req, res) {
  var password = req.body.password;
  var passwordConfirm = req.body.passwordConfirm;

  AccessTokens.getById(req.params.token, function(err, invite) {
    if (!err && invite) {
      Users.getById(
        invite.details.user_id,
        { permissions: { users: { name: true } } },
        function(err, user) {
          if (!err && user && invite.details.action == "add-user") {
            if (invite.used == 0) {
              if (moment(invite.expirationTimestamp).isAfter(moment())) {
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
                            Users.update(
                              { deactivated: 0 },
                              { where: { id: user.id } }
                            ).nodeify(function(err) {
                              AccessTokens.markAsUsed(invite.token, function(
                                err
                              ) {
                                req.flash(
                                  "success_msg",
                                  "Password set! You can now login."
                                );
                                res.redirect(
                                  process.env.PUBLIC_ADDRESS + "/login"
                                );
                              });
                            });
                          } else {
                            req.flash(
                              "error",
                              "Something went wrong! Please try again."
                            );
                            res.redirect(
                              process.env.PUBLIC_ADDRESS +
                                "/users/invite/" +
                                invite.token
                            );
                          }
                        });
                      } else {
                        req.flash("error", "Passwords don't match!");
                        res.redirect(
                          process.env.PUBLIC_ADDRESS +
                            "/users/invite/" +
                            invite.token
                        );
                      }
                    } else {
                      req.flash("error", "Please confirm you password.");
                      res.redirect(
                        process.env.PUBLIC_ADDRESS +
                          "/users/invite/" +
                          invite.token
                      );
                    }
                  } else {
                    req.flash("error", "Please enter a valid password.");
                    res.redirect(
                      process.env.PUBLIC_ADDRESS +
                        "/users/invite/" +
                        invite.token
                    );
                  }
                } else {
                  req.flash("error", "Please enter a password.");
                  res.redirect(
                    process.env.PUBLIC_ADDRESS + "/users/invite/" + invite.token
                  );
                }
              } else {
                res.render("error", {
                  title: "Invite Expired",
                  specificError: {
                    title: "Invalid Expired",
                    message: "This invite has expired!"
                  }
                });
              }
            } else {
              res.render("error", {
                title: "Invite Used",
                specificError: {
                  title: "Invalid Used",
                  message: "This invite has already been used!"
                }
              });
            }
          } else {
            res.render("error", {
              title: "Invalid Invite",
              specificError: {
                title: "Invalid Invite",
                message:
                  "Something went wrong when creating this invite. Please <a href='" +
                  process.env.PUBLIC_ADDRESS +
                  "/support'>contact support</a>."
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
