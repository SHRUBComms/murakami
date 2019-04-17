// Load environment variables
require("dotenv").config();

// Import resources
var express = require("express");
var cors = require("cors");
var app = express();
var bodyParser = require("body-parser");
var flash = require("connect-flash");
var hbs = require("express-handlebars");
var path = require("path");
var session = require("cookie-session");
var passport = require("passport");
var cookieParser = require("cookie-parser");
var back = require("express-back");
var validator = require("express-validator");
var async = require("async");

var VolunteerRoles = require(process.env.CWD + "/app/models/volunteer-roles");

if (process.env.NODE_ENV != "development") {
  process.on("uncaughtException", function(err) {
    console.error(err);
    console.log("Exception caught");
  });
}

var Users = require("./app/models/users");
var WorkingGroups = require("./app/models/working-groups");

// Setup Handlebars
app.set("views", path.join(__dirname, "app/views"));
app.engine(
  "hbs",
  hbs({
    layoutsDir: path.join(__dirname, "app/views/layouts"),
    partialsDir: path.join(__dirname, "app/views/partials"),
    defaultLayout: "layout",
    extname: ".hbs",
    helpers: require("./app/configs/hbs_helpers.js").helpers
  })
);
app.set("view engine", "hbs");

// Overwrite default date formatter (broken in current version of node)
Date.prototype.toLocaleDateString = function() {
  return `${this.getDate()}/${this.getMonth() + 1}/${this.getFullYear()}`;
};

String.prototype.toProperCase = function() {
  return this.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

process.env.NODE_ENV = process.env.NODE_ENV || "development";

// Define port (if not already)
var port = process.env.PORT || 3000;
var path = process.env.PUBLIC_PATH || "";

// Define public (static) directory
app.use(path, express.static("app/public"));

// CORS
app.use(cors());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
    cookie: {
      path: "/",
      httpOnly: true
    },
    name: "murakami_biscuit"
  })
);
app.use(back());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
// Express Validator
app.use(
  validator({
    customValidators: {
      isEmailAvailable: function(email) {
        return new Promise(function(resolve, reject) {
          Users.getByEmail(email, function(err, results) {
            if (results.length == 0) {
              return resolve();
            } else {
              return reject();
            }
          });
        });
      },
      isUsernameAvailable: function(username) {
        return new Promise(function(resolve, reject) {
          Users.getByUsername(username, function(err, results) {
            if (results.length == 0) {
              return resolve();
            } else {
              return reject();
            }
          });
        });
      }
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Connect Flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.public_address = process.env.PUBLIC_ADDRESS;

  if (req.user) {
    req.user.permissions = JSON.parse(req.user.permissions);

    res.locals.user = req.user;
    if (req.user.deactivated == 0) {
      req.user[req.user.class] = 1;
      req.user.name = req.user.first_name + " " + req.user.last_name;

      req.user.notification_preferences =
        req.user.notification_preferences || {};

      VolunteerRoles.getAll(function(err, rolesArray, rolesByGroup, rolesObj) {
        req.user.allVolunteerRoles = rolesObj;
        WorkingGroups.getAll(function(
          err,
          allWorkingGroupsObj,
          allWorkingGroupsArray,
          allWorkingGroupsFlat
        ) {
          req.user.allWorkingGroups,
            (req.user.allWorkingGroupsObj = allWorkingGroupsObj);
          req.user.all_working_groups_arr,
            (req.user.working_groups_arr = allWorkingGroupsArray);

          req.user.allWorkingGroupsFlat = allWorkingGroupsFlat;
          next();
        });
      });
    } else {
      res.locals.user = null;
      req.logout();
      req.session = null;
      next();
    }
  } else {
    res.locals.user = null;
    next();
  }
});

var job = require("./app/configs/cron");
job.start();

// Define routers
app.use(path, require("./app/routes/root"));

// Start server
app.listen(port);
console.log("### " + process.env.NODE_ENV.toUpperCase() + " ###");
console.log("Server started on local port " + port);
console.log("Running on public address " + process.env.PUBLIC_ADDRESS);

module.exports.getApp = app;
