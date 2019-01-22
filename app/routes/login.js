// /login

var router = require("express").Router();
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;

var rootDir = process.env.CWD;

var Users = require(rootDir + "/app/models/users");
var Attempts = require(rootDir + "/app/models/attempts");
var Settings = require(rootDir + "/app/models/settings");

passport.use(
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
      passReqToCallback: true
    },
    function(req, username, password, done) {
      Users.getByUsernameOrEmail(username, function(err, user) {
        if (err) throw err;
        if (!user[0]) {
          return done(null, false, { message: "Account not found!" });
        }
        Attempts.getAllAttemptsThisHour(user[0].id, function(err, attempts) {
          if (attempts.length <= 5) {
            Users.comparePassword(password, user[0].password, function(
              err,
              isMatch
            ) {
              if (err) throw err;
              if (isMatch) {
                Attempts.passed(
                  user[0].id,
                  req.headers["x-forwarded-for"] || req.connection.remoteAddress
                );
                return done(null, user[0]);
              } else {
                Attempts.failed(
                  user[0].id,
                  req.headers["x-forwarded-for"] || req.connection.remoteAddress
                );
                return done(null, false, { message: "Wrong password!" });
              }
            });
          } else {
            return done(null, false, {
              message:
                'This account is locked. <a href="/support">Contact support</a>'
            });
          }
        });
      });
    }
  )
);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  Users.getById(id, { class: "admin" }, function(err, user) {
    if (err) {
      return done(null, err);
    }
    done(null, user[0]);
  });
});

router.post(
  "/",
  passport.authenticate("local", {
    failureRedirect: "/login",
    badRequestMessage: "Please enter your details",
    failureFlash: true
  }),
  function(req, res) {
    res.redirect("/");
  }
);

router.get("/", function(req, res) {
  if (!req.user) {
    Settings.getAll(function(err, settings) {
      res.render("login", {
        loginActive: true,
        title: "Login",
        settings: settings[0]
      });
    });
  } else {
    res.redirect("/");
  }
});

module.exports = router;
