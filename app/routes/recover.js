// /recover

var router = require("express").Router();

var rootDir = process.env.CWD;

var Settings = require(rootDir + "/app/models/settings");
var Users = require(rootDir + "/app/models/users");

var Mail = require(rootDir + "/app/configs/mail");

router.get('/', function(req, res){
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

router.get('/:reset_code', function(req, res){
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

router.post('/:reset_code', function(req, res){
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

router.post('/', function(req, res){
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

module.exports = router;