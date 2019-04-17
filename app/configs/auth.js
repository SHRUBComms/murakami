var rootDir = process.env.CWD;

var AccessTokens = require(rootDir + "/app/models/access-tokens");
var Members = require(rootDir + "/app/models/members");
var Volunteers = require(rootDir + "/app/models/volunteers");

var Auth = {};

Auth.isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/login");
  }
};

Auth.canAccessPage = function(parent, page) {
  return function(req, res, next) {
    try {
      if (req.user.permissions[parent][page]) {
        return next();
      } else {
        res.redirect("/");
      }
    } catch (err) {
      res.redirect("/");
    }
  };
};

Auth.isNotLoggedIn = function(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/");
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

// TEMPORARY
Auth.verifyByKey = function(req, res, next) {
  if (req.query.key) {
    if (req.query.key === process.env.TEMPORARY_API_KEY) {
      return next();
    } else {
      res.send({ message: "Permission denied" });
    }
  } else {
    res.send({ message: "Permission denied" });
  }
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
