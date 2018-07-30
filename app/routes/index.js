// Import resources
var express = require('express');
var router = express.Router();
var app = express();
var passport = require("passport");
var LocalStrategy = require('passport-local').Strategy;

var Users = require('../models/users');
var Attempts = require('../models/attempts');
var Settings = require('../models/settings');
var Mail = require('../configs/mail');
var Auth = require("../configs/auth");
var Carbon = require("../models/carbon-calculations");
var AccessTokens = require("../models/access-tokens");

var Recaptcha = require('express-recaptcha').Recaptcha;
 
var recaptcha = new Recaptcha(process.env.RECAPTCHA_SITE_KEY, process.env.RECAPTCHA_SECRET_KEY);

// Root redirect
router.get('/', function(req, res){
  res.redirect('/members');
});

router.get('/error', function(req, res){
  res.render('error');
})

router.get('/log', function(req, res){
  res.redirect('/log-volunteer-hours');
})

router.get('/log-volunteer-hours', function(req, res){
  res.render('log-volunteer-hours', {
    title: 'Log Volunteer Hours',
    membersActive: true,
    captcha:recaptcha.render()
  });  
})

router.get('/success', function(req, res){
  res.render('success', {
    layout: 'login-layout'
  });
});

router.get('/support', function(req, res){
  res.render('support', {
    layout: 'login-layout',
    title: 'Support'
  });
});


router.post('/support', function(req,res){
  var name = req.body.name;
  var email = req.body.email;
  var subject = req.body.subject;
  var message = req.body.message;

  // Validation
  req.checkBody("name", "Please enter a name").notEmpty();
  req.checkBody("name", "Please enter a shorter name (<= 50 characters)").isLength({max: 50});

  req.checkBody("email", "Please enter an email address").notEmpty();
  req.checkBody("email", "Please enter a shorter email address (<= 89 characters)").isLength({max: 89});
  req.checkBody("email", "Please enter a valid email address").isEmail();

  req.checkBody("subject", "Please enter a subject line").notEmpty();
  req.checkBody("subject", "Please enter a shorter subject line (<= 100 characters)").isLength({max: 100});

  req.checkBody("message", "Please enter a message").notEmpty();
  req.checkBody("message", "Please enter a shorter message (<= 10000 characters)").isLength({max: 10000});


  // Parse request's body
  var errors = req.validationErrors();
    if(errors) {
      res.render('support', {
        errors: errors,
        name: name,
        email: email,
        subject: subject,
        message: message
      }); 
    } else {
      Mail.sendSupport(name, email, subject, message, function(err){
        if(err){
          req.flash('error_msg', 'Something went wrong! Please try again');
          res.render('support', {
            name: name,
            email: email,
            subject: subject,
            message: message
          });   
        } else {
          req.flash('success_msg', 'Message sent!');
          res.redirect('/support');
        }
      });
    }
});

router.get('/login', function (req, res){
  Settings.getAll(function(err, settings){
    res.render('login', {
      layout: 'login-layout',
      title: 'Login',
      settings: settings[0]
    });
  })
});

router.get('/recover', function(req, res){
  Settings.getAll(function(err, settings){
    if(settings[0].password_reset == 1) {
      res.render('recover', {
        layout: 'login-layout',
        title: 'Account Recovery'
      });
    } else {
      res.redirect('/');
    }
  }) 
});

router.get('/recover/:reset_code', function(req, res){
  Users.getUnusedPasswordResetsByResetCode(req.params.reset_code, function(err, resets) {
    if(resets[0]){
      res.render('reset', {
        layout: 'login-layout',
        title: 'Account Recovery',
        reset_code: req.params.reset_code
      });
    } else {
      res.redirect("/");
    }
  });
});

router.post('/recover/:reset_code', function(req, res){
  Users.getUnusedPasswordResetsByResetCode(req.params.reset_code, function(err, resets) {
    if(resets[0]){
      var password = req.body.password;
      var passwordConfirm = req.body.passwordConfirm;
      console.log(password)

      req.checkBody("password", "Please enter a password").notEmpty();
      req.checkBody("password", "Please enter a shorter password (<= 255 characters)").isLength({max: 255});
      
      if(req.body.password){
        req.assert('passwordConfirm', 'Passwords do not match').equals(req.body.password);
      }

      req.asyncValidationErrors().then(function() {
        Users.updatePassword(resets[0].user_id, password, function(err){
          if(err){
            req.flash('error_msg', 'Something went wrong!');
            res.redirect("/recover/" + resets[0].reset_code);
          } else {
            Users.setResetCodeAsUsed(resets[0].reset_code, function(err){
              if(err) {
                req.flash('error_msg', 'Something went wrong!');
                res.redirect("/recover/" + resets[0].reset_code); 
              } else {
                req.flash('success_msg', 'Password reset!');
                res.redirect("/login");                
              }
            });
          }
        }); 

      }).catch(function(errors) {

        res.render('reset',{
          layout: 'login-layout',
          errors: errors,
          title: "Account Recovery",
          reset_code: resets[0].reset_code
        });

      });

    } else {
      res.redirect("/");
    }
  });
});

router.post('/recover', function(req, res){
  Settings.getAll(function(err, settings){
    if(settings[0].password_reset == 1) {
      var username = req.body.username.trim()
      req.checkBody("username", "Please enter a username").notEmpty();

      req.asyncValidationErrors().then(function() {

        Users.getByUsername(username, function(err, user){
          if(err || !user[0]){
            req.flash('error_msg', 'Couldn\'t find that user!');
            res.redirect("/recover");
          } else {
            Users.getUnusedPasswordResetsByUserId(user[0].id, function(err, resets) {
              if(!resets[0]){
                Users.addPasswordReset(user[0].id, req.headers['x-forwarded-for'] || req.connection.remoteAddress, function(err){
                  if(err) {
                    console.log(err);
                    req.flash('error_msg', 'Something went wrong!');
                    res.redirect("/recover");
                  } else {
                      Users.getUnusedPasswordResetsByUserId(user[0].id, function(err, resets) {
                        if(err) {
                          console.log(err);
                          req.flash('error_msg', 'Something went wrong!');
                          res.redirect("/recover");
                        } else {
                          var name = user[0].first_name + " " + user[0].last_name;
                          var email = user[0].email;
                          var subject = "Account Recovery";
                          var html = "<h1>Hey " + user[0].first_name + "!</h1>" + 
                          "<p>Recover your account <a href='https://murakami.org.uk/recover/" + resets[0].reset_code + "'>here</a>. This link will expire in one hour.</p>" + 
                          "<p>From Murakami</p>";
                          Mail.sendUsers(name, email, subject, html, function(err){
                            if(err) {
                              console.log(err);
                              req.flash('error_msg', 'Something went wrong sending you your recovery link, please <a href="/support">contact support</a>');
                              res.redirect("/recover");                        
                            } else {
                              req.flash('success_msg', 'An email with recovery instructions has been sent!');
                              res.redirect("/recover");
                            }
                          });
                        }
                    });            
                  }
                });
              } else {
                req.flash('error_msg', 'Account recovery process has already been initiated for this user!');
                res.redirect("/recover");                
              }
            });
          }
        });

      }).catch(function(errors){
        Settings.getAll(function(err, settings){
          res.render('recover',{
            layout: 'login-layout',
            errors: errors,
            settings: settings[0]
          });
        });
      })
    } else {
      res.redirect("/");
    }
  });
});

router.get('/privacy', function (req, res){
  res.render('privacy', {
    title: 'Privacy Policy'
  });
});

router.get('/log-outgoing-weight', Auth.isLoggedIn, function(req, res){
  Settings.getAll(function(err, settings){
    settings = settings[0];
    settings.definitions = JSON.parse(settings.definitions);
    res.render('log-outgoing-weight', {
      title: 'Log Outgoing Weight (Non-member)',
      settings: settings
    });
  })
});

router.post('/carbon-calculations', Auth.isLoggedIn, function(req, res){
  var message = {
    status: "fail",
    msg: null
  };

  var transaction = req.body.transaction;
  var formattedTransaction = {}
  formattedTransaction.member_id = "anon";
  formattedTransaction.trans_object = {};
  formattedTransaction.amount = 0;

  for(i=0; i<transaction.length; i++){

    if(!isNaN(parseFloat(transaction[i].weight)) && transaction[i].weight > 0){

      if(formattedTransaction.trans_object[transaction[i].id] == null){
        formattedTransaction.trans_object[transaction[i].id] = transaction[i].weight;
      } else {
        formattedTransaction.trans_object[transaction[i].id] = +transaction[i].weight + +formattedTransaction.trans_object[transaction[i].id];
      }
      
    }
  }

  Object.keys(formattedTransaction.trans_object).forEach(function(key) {            
    formattedTransaction.amount += +formattedTransaction.trans_object[key];
  }); 


  if(formattedTransaction.amount > 0){

    formattedTransaction.trans_object = JSON.stringify(formattedTransaction.trans_object);
    Carbon.add(formattedTransaction, function(err){
      if(err) {
        message.status = "fail";
        message.msg = "Something went wrong!";
        res.send(message);
      } else {
        totalCarbon = 0;
        Settings.getAll(function(err, settings){
          settings = settings[0];
          settings.definitions = JSON.parse(settings.definitions);
          formattedTransaction.trans_object = JSON.parse(formattedTransaction.trans_object)

          Object.keys(formattedTransaction.trans_object).forEach(function(key) {
              for(j=0;j<settings.definitions.items.length;j++){
                if(key == settings.definitions.items[j].id){
                  totalCarbon += (formattedTransaction.trans_object[key] * settings.definitions.items[j].factor) * 1e-3;
                }
              }
          });
          message.status = "ok";
          message.msg = "Weight logged! " + totalCarbon.toFixed(2) + "kg of carbon saved";
          res.send(message);
        });
      }
    });
  } else {
    message.status = "fail";
    message.msg = "Please enter a total weight greater than 0";
    res.send(message);    
  }

});

router.get('/get-carbon-calculations', function(req, res){
  Carbon.getAllThisYear(function(err, carbon){
    if(err || carbon.length == 0){
      res.send("0");
    } else {
      totalCarbon = 0;
      Settings.getAll(function(err, settings){
        settings = settings[0];
        settings.definitions = JSON.parse(settings.definitions);
        for(i=0;i<carbon.length;i++){
          carbon[i].trans_object = JSON.parse(carbon[i].trans_object);

          Object.keys(carbon[i].trans_object).forEach(function(key) {
              for(j=0;j<settings.definitions.items.length;j++){
                if(key == settings.definitions.items[j].id){
                  totalCarbon += (carbon[i].trans_object[key] * settings.definitions.items[j].factor) * 1e-6;
                }
              }
          });
        }

        res.send(totalCarbon.toFixed(3));
      });
    }
  });
});

passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
  },
  function(req, username, password, done) {
    Users.getByUsernameOrEmail(username, function(err, user){
   	  if(err) throw err;
   	  if(!user[0]){
   		  return done(null, false, {message: 'Account not found!'});
   	  }
      Attempts.getAllAttemptsThisHour(user[0].id, function(err, attempts){
        if(attempts.length <= 5){
          Users.comparePassword(password, user[0].password, function(err, isMatch){
            if(err) throw err;
            if(isMatch){
              Attempts.passed(user[0].id, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
              return done(null, user[0]);
              
            } else {
              Attempts.failed(user[0].id, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
              return done(null, false, {message: 'Wrong password!'});
            }
          });
        } else {
          return done(null, false, {message: 'This account is locked. <a href="/support">Contact support</a>'});
        }
      });
    });
  })
);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  Users.getById(id, function(err, user) {
    if(err){
        return done(null,err);
    }
    done(null, user[0]);
  });
});

router.post('/login',
  passport.authenticate('local', 
    {
      successRedirect:'/members', 
      failureRedirect:'/login', 
      badRequestMessage : 'Please enter your details', 
      failureFlash: true
    }),
  function(req, res) {
    res.redirect('/members');
  }
);

router.get('/logout', function(req, res){
  req.logout();
  req.session = null;

  res.redirect('/login');
});


router.get('/error', function (req, res){
	res.render('error', {
		title: 'Error'
	});
});

// Handle errors here
router.get('*', function(req, res){
    res.render('error', {
        title: "Page Not Found",
        notFound: true
    });
});

module.exports = router;