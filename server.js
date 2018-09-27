// MURAKAMI 2.0

// LOAD ENVIRONMENT VARS
require('dotenv').config()

// Import resources
var express = require('express');
var cors = require('cors')
var app = express();
var bodyParser = require("body-parser");
var flash = require("connect-flash");
var hbs  = require('express-handlebars');
var path = require("path");
var session = require("cookie-session")
var passport = require("passport");
var cookieParser = require("cookie-parser");
var back = require('express-back');
var validator = require('express-validator');
var async = require('async')

if(process.env.NODE_ENV != "development"){
  process.on('uncaughtException', function (err) {
    console.error(err);
    console.log("Exception caught");
  });
}

var Settings = require("./app/models/settings");
var Users = require("./app/models/users");
var WorkingGroups = require("./app/models/working-groups");

// Setup Handlebars
app.set('views', path.join(__dirname, 'app/views'));
app.engine('hbs', hbs({
    layoutsDir   : path.join(__dirname, 'app/views/layouts'),
    defaultLayout: 'layout', 
    extname: '.hbs',
    helpers: require("./app/public/js/helpers.js").helpers
}));
app.set('view engine', 'hbs');

// Overwrite default date formatter (broken in current version of node)
Date.prototype.toLocaleDateString = function () {
    return `${this.getDate()}/${this.getMonth() + 1}/${this.getFullYear()}`;
};


String.prototype.censorEmail=function() {
    var email = this.split('@');
    return email[0].slice(0,1) + "*****" + email[0].slice(-1) + "@" + email[1].slice(0, 1) + "*****" + email[1].slice(-1);
}

String.prototype.censorFullName=function() {
    var name = this.split(' ');
    nameCensored = '';
    for(i=0; i<name.length;i++){
      nameCensored += name[i].slice(0,1) + "*****" + name[i].slice(-1)
    }
    return nameCensored;
}

process.env.NODE_ENV = process.env.NODE_ENV || "development";

// Define port (if not already)
var port = process.env.PORT || 3000;

// Define public (static) directory
app.use(express.static('app/public'));

app.use(cors())

app.use(session({
  secret: process.env.SESSION_SECRET,
  saveUninitialized: true,
  cookie: {
    path: "/",
    httpOnly: true
  },
  name: "murakami_biscuit"
}));
app.use(back());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
// Express Validator
app.use(validator({
  customValidators: {
    isEmailAvailable: function(email) {
      return new Promise(function(resolve, reject) {
          Users.getByEmail(email, function(err, results) { 
              if(results.length == 0) {
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
              if(results.length == 0) {
                return resolve();
              } else {
                return reject();
              }
          });
      });
    }
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Connect Flash
app.use(flash());

Settings.getAll(function(err, settings){
  var globalSettings = settings[0];
})

// Global variables
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  if(req.user){
    res.locals.user = req.user
    if(req.user.deactivated == 0){
      if(req.user.admin){
        req.user.admin_wg = JSON.parse(req.user.admin_wg);
        Settings.getAll(function(err, settings){
          settings = settings[0];
          settings.definitions = JSON.parse(settings.definitions)
          async.eachOf(req.user.admin_wg, function(wg, i, callback){
            WorkingGroups.verifyGroupById(wg, settings, function(group){
              req.user.admin_wg[i] = group;
            });
            callback()
          }, function(err){
            next()
          });        
        });
      
      } else {
        next();
      }
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


// Import routers
var appRouter = require('./app/routes/root');
var apiRouter = require("./app/routes/api/root");
var membersRouter = require("./app/routes/members/root");
var reportsRouter = require("./app/routes/reports/root");
var settingsRouter = require("./app/routes/settings/root");
var workingGroupsRouter = require("./app/routes/working-groups/root");
var usersRouter = require("./app/routes/users/root");

// Use routers
app.use('/members', membersRouter);
app.use('/api', apiRouter);
app.use('/reports', reportsRouter);
app.use('/settings', settingsRouter);
app.use('/working-groups', workingGroupsRouter);
app.use('/users', usersRouter);
app.use('/', appRouter); // *ALWAYS* PLACE THIS ROUTER LAST

// Start server
app.listen(port);
console.log('### ' + process.env.NODE_ENV.toUpperCase() + ' ###');
console.log('Server started on port ' + port);

module.exports.getApp = app;