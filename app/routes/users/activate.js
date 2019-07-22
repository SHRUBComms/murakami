// /users/activate

var router = require("express").Router();
var moment = require("moment");
moment.locale("en-gb");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");
var Users = Models.Users;
var AccessTokens = Models.AccessTokens;

var Auth = require(rootDir + "/app/configs/auth");
var Mail = require(rootDir + "/app/configs/mail");
var Helpers = require(rootDir + "/app/helper-functions/root");

router.get(
  "/:user_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("users", "deactivate"),
  function(req, res) {
    Users.getById(req.params.user_id, req.user, function(err, user) {
      if (user && !err) {
        if (user.deactivated == 1) {
          if (user.canDeactivate) {
            var validClasses = [];
            if (req.user.class == "admin") {
              validClasses = ["admin", "staff", "volunteer", "till"];
            } else {
              validClasses = ["till", "volunteer"];
            }
            if (validClasses.includes(user.class)) {
              AccessTokens.findOne({
                where: {
                  used: 0,
                  timestamp: {
                    [Models.Sequelize.Op.gte]: moment()
                      .subtract(24, "hours")
                      .toDate()
                  },
                  details: { user_id: user.id }
                }
              }).nodeify(function(err, results) {
                if (!err && !results) {
                  var expirationTimestamp = moment()
                    .add(7, "days")
                    .toDate();
                  AccessTokens.createInvite(
                    expirationTimestamp,
                    {
                      action: "add-user",
                      invitedBy: req.user.id,
                      user_id: user.id
                    },
                    function(err, token) {
                      if (!err && token) {
                        var inviteLink =
                          process.env.PUBLIC_ADDRESS + "/users/invite/" + token;
                        Mail.sendGeneral(
                          user.first_name +
                            " " +
                            user.last_name +
                            " <" +
                            user.email +
                            ">",
                          "Murakami Invite",
                          "<p>Hey " +
                            user.first_name +
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
                                  "/users/update/" +
                                  user.id
                              );
                            } else {
                              req.flash(
                                "success_msg",
                                "Invite sent successfully!"
                              );
                              res.redirect(
                                process.env.PUBLIC_ADDRESS +
                                  "/users/update/" +
                                  user.id
                              );
                            }
                          }
                        );
                      } else {
                        req.flash("error_msg", "Something went wrong!");
                        res.redirect(
                          process.env.PUBLIC_ADDRESS +
                            "/users/update/" +
                            user.id
                        );
                      }
                    }
                  );
                } else {
                  req.flash(
                    "error_msg",
                    "An activation link has already been issued!"
                  );
                  res.redirect(
                    process.env.PUBLIC_ADDRESS + "/users/update/" + user.id
                  );
                }
              });
            } else {
              req.flash(
                "error_msg",
                "You can't activate a user of a higher class!"
              );
              res.redirect(
                process.env.PUBLIC_ADDRESS + "/users/update/" + user.id
              );
            }
          } else {
            req.flash("error_msg", "You're not permitted to do that!");
            res.redirect(
              process.env.PUBLIC_ADDRESS + "/users/update/" + user.id
            );
          }
        } else {
          req.flash("error", "User is already activated!");
          res.redirect(process.env.PUBLIC_ADDRESS + "/users/update/" + user.id);
        }
      } else {
        req.flash("error", "Something went wrong.");
        res.redirect(process.env.PUBLIC_ADDRESS + "/users/manage");
      }
    });
  }
);

module.exports = router;
