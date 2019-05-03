// /login

var router = require("express").Router();
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");

var Users = Models.Users;
var Attempts = Models.Attempts;
var Settings = Models.Settings;

passport.use(
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
      passReqToCallback: true
    },
    function(req, username, password, done) {
      Users.getByUsernameOrEmail(username, function(err, user) {
        if (user) {
          Attempts.getAllFailedAttemptsThisHour(user.id, function(
            err,
            attempts
          ) {
            if (attempts.length <= 5) {
              Users.comparePassword(password, user.password, function(
                err,
                isMatch
              ) {
                if (isMatch) {
                  Attempts.passed(
                    user.id,
                    req.headers["x-forwarded-for"] ||
                      req.connection.remoteAddress
                  );
                  return done(null, user);
                } else {
                  Attempts.failed(
                    user.id,
                    req.headers["x-forwarded-for"] ||
                      req.connection.remoteAddress
                  );
                  return done(null, false, { message: "Wrong password!" });
                }
              });
            } else {
              return done(null, false, {
                message:
                  'This account is locked. <a href="' +
                  process.env.PUBLIC_ADDRESS +
                  '/support">Contact support</a>'
              });
            }
          });
        } else {
          return done(null, false, { message: "Account not found!" });
        }
      });
    }
  )
);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  Users.getById(
    id,
    {
      id: id
    },
    function(err, user) {
      if (err) {
        return done(null, err);
      } else {
        done(null, user);
      }
    }
  );
});

router.post(
  "/",
  passport.authenticate("local", {
    failureRedirect: "/login",
    badRequestMessage: "Please enter your details",
    failureFlash: true
  }),
  function(req, res) {
    if (req.user) {
      console.log(
        new Date(),
        "Passport callback: user authenticated, redirecting"
      );
    }
    res.redirect(process.env.PUBLIC_ADDRESS + "/");
  }
);

router.get("/", function(req, res) {
  if (!req.user) {
    Settings.getAll(function(err, settings) {
      res.render("login", {
        loginActive: true,
        title: "Login",
        settings: settings
      });
    });
  } else {
    res.redirect(process.env.PUBLIC_ADDRESS + "/");
  }
});

module.exports = router;
