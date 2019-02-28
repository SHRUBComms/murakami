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

String.prototype.censorEmail = function() {
  var email = this.split("@");
  return (
    email[0].slice(0, 1) +
    "*****" +
    email[0].slice(-1) +
    "@" +
    email[1].slice(0, 1) +
    "*****" +
    email[1].slice(-1)
  );
};

String.prototype.censorFullName = function() {
  var name = this.split(" ");
  nameCensored = "";
  for (let i = 0; i < name.length; i++) {
    nameCensored += name[i].slice(0, 1) + "*****" + name[i].slice(-1);
  }
  return nameCensored;
};

process.env.NODE_ENV = process.env.NODE_ENV || "development";

// Define port (if not already)
var port = process.env.PORT || 3000;

// Define public (static) directory
app.use(express.static("app/public"));

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
    res.locals.user = req.user;
    if (req.user.deactivated == 0) {
      if (req.user.class == "admin") {
        req.user.admin = 1;
      } else {
        req.user.admin = 0;
        if (req.user.class == "till") {
          res.locals.tillMode = true;
        }
      }
      req.user.name = req.user.first_name + " " + req.user.last_name;

      req.user.notification_preferences =
        req.user.notification_preferences || {};

      VolunteerRoles.getAll(function(err, rolesArray, rolesByGroup, rolesObj) {
        req.user.allVolunteerRoles = rolesObj;
        WorkingGroups.getAll(function(err, working_groups_arr) {
          var working_groups = {};
          res.locals.allWorkingGroups = working_groups_arr;
          var all_working_groups_arr = [];

          async.each(
            working_groups_arr,
            function(group, callback) {
              all_working_groups_arr.push(group.group_id);
              working_groups[group.group_id] = group;
              if (group.parent) {
                try {
                  working_groups[group.parent].children.push(group.group_id);
                } catch (err) {
                  working_groups[group.parent].children = [group.group_id];
                }
              }
              callback();
            },
            function() {
              req.user.allWorkingGroupsObj = working_groups;

              async.eachOf(
                req.user.working_groups,
                function(wg, i, callback) {
                  req.user.working_groups[i] =
                    working_groups[req.user.working_groups[i]];

                  if (req.user.working_groups[i].parent) {
                    req.user.working_groups[i].full_name =
                      req.user.allWorkingGroupsObj[
                        req.user.working_groups[i].parent
                      ].name + ": ";

                    req.user.working_groups[i].name;
                  } else {
                    req.user.working_groups[i].full_name =
                      req.user.working_groups[i].name;
                  }

                  callback();
                },
                function(err) {
                  var working_groups = req.user.working_groups || [];

                  req.user.working_groups_arr = working_groups.map(function(
                    obj
                  ) {
                    return obj.group_id;
                  });
                  req.user.all_working_groups_arr = all_working_groups_arr;
                  next();
                }
              );
            }
          );
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
app.use("/members", require("./app/routes/members/root"));
app.use("/api", require("./app/routes/api/root"));
app.use("/till", require("./app/routes/till/root"));
app.use("/settings", require("./app/routes/settings/root"));
app.use("/working-groups", require("./app/routes/working-groups/root"));
app.use("/users", require("./app/routes/users/root"));
app.use("/volunteers", require("./app/routes/volunteers/root"));
app.use("/carbon-accounting", require("./app/routes/carbon-accounting/root"));
app.use("/", require("./app/routes/root")); // *ALWAYS* PLACE THIS ROUTER LAST

// Start server
app.listen(port);
console.log("### " + process.env.NODE_ENV.toUpperCase() + " ###");
console.log("Server started on local port " + port);
console.log("Running on public address " + process.env.PUBLIC_ADDRESS);

module.exports.getApp = app;
