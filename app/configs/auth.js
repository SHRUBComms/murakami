var rootDir = process.env.CWD;

var moment = require("moment");
moment.locale("en-gb");

var Models = require(rootDir + "/app/models/sequelize");

var AccessTokens = Models.AccessTokens;

var Auth = {};

Auth.isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect(process.env.PUBLIC_ADDRESS + "/login");
  }
};

Auth.canAccessPage = function(parent, page) {
  return function(req, res, next) {
    try {
      if (req.user.permissions[parent][page]) {
        return next();
      } else {
        res.redirect(process.env.PUBLIC_ADDRESS + "/");
      }
    } catch (err) {
      res.redirect(process.env.PUBLIC_ADDRESS + "/");
    }
  };
};

Auth.isNotLoggedIn = function(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  } else {
    res.redirect(process.env.PUBLIC_ADDRESS + "/");
  }
};

Auth.isOfClass = function(allowedClasses) {
  return function(req, res, next) {
    if (allowedClasses.includes(req.user.class)) {
      return next();
    } else {
      res.redirect("/");
    }
  };
};

Auth.verifyByKey = function(resource) {
  return function(req, res, next) {
    var failResponse = { status: "fail", msg: "Permission denied." };

    var validResources = [
      "carbonSavings",
      "publicVolunteerRoles",
      "tillRevenue"
    ];

    if (validResources.includes(resource)) {
      if (req.query.key || req.query.token) {
        var key = req.query.key || req.query.token;
        AccessTokens.getById(key, function(err, token) {
          if (!err && token) {
            if (token.used == 0) {
              if (moment(token.expirationTimestamp).isAfter(moment())) {
                try {
                  if (token.details.resource == resource) {
                    return next();
                  } else {
                    res.send(failResponse);
                  }
                } catch (err) {
                  res.send(failResponse);
                }
              } else {
                failResponse.msg =
                  "Key has expired. Contact administrator to reissue.";
                res.send(failResponse);
              }
            } else {
              failResponse.msg =
                "Key is no longer valid. Contact administrator to reissue.";
              res.send(failResponse);
            }
          } else {
            res.send(failResponse);
          }
        });
      } else {
        failResponse.msg = "Key has expired.";
        res.send(failResponse);
      }
    } else {
      res.send(failResponse);
    }
  };
};

Auth.hasValidToken = function(action) {
  return function(req, res, next) {
    AccessTokens.getById(req.params.token || req.query.token, function(
      err,
      invite
    ) {
      if (invite.details) {
        if (invite.details.action == action) {
          res.invite = invite;
          return next();
        } else {
          res.redirect("/");
        }
      } else {
        res.redirect("/");
      }
    });
  };
};

module.exports = Auth;
