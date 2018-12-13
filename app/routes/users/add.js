// /users/add

var router = require("express").Router();

var rootDir = process.env.CWD;

var Users = require(rootDir + "/app/models/users");
var WorkingGroups = require(rootDir + "/app/models/working-groups");

var Auth = require(rootDir + "/app/configs/auth");

router.get("/", Auth.isLoggedIn, Auth.isOfClass(["admin"]), function(req, res) {
  WorkingGroups.getAll(function(err, workingGroups) {
    res.render("users/add", {
      title: "Add User",
      usersActive: true,
      allWorkingGroups: workingGroups,
      working_groups: {}
    });
  });
});

router.post("/", Auth.isLoggedIn, Auth.isOfClass(["admin"]), function(
  req,
  res
) {
  var first_name = req.body.first_name.trim();
  var last_name = req.body.last_name.trim();
  var username = req.body.username.trim();
  var email = req.body.email.trim();
  var userClass = req.body.class;
  var password = req.body.password;
  var passwordConfirm = req.body.passwordConfirm;
  if (req.body.working_groups) {
    var working_groups = JSON.parse(req.body.working_groups);
  }

  // Validation
  if (username) {
    req
      .check(
        "username",
        "This username is already in use! Please enter something different"
      )
      .isUsernameAvailable();
  }
  if (email) {
    req
      .check(
        "email",
        "This email address is already in use! Please enter something different"
      )
      .isEmailAvailable();
  }

  req.checkBody("first_name", "Please enter a first name").notEmpty();
  req
    .checkBody(
      "first_name",
      "Please enter a shorter first name (<= 20 characters)"
    )
    .isLength({ max: 20 });

  req.checkBody("last_name", "Please enter a last name").notEmpty();
  req
    .checkBody(
      "last_name",
      "Please enter a shorter last name (<= 30 characters)"
    )
    .isLength({ max: 30 });

  req.checkBody("username", "Please enter a username").notEmpty();
  req
    .checkBody("username", "Please enter a shorter username (<= 20 characters)")
    .isLength({ max: 20 });
  req
    .checkBody("username", "Please enter a valid username")
    .matches(/^[A-Za-z0-9]+(?:[._-][A-Za-z0-9]+)*$/);

  req.checkBody("email", "Please enter an email address").notEmpty();
  req
    .checkBody(
      "email",
      "Please enter a shorter email address (<= 89 characters)"
    )
    .isLength({ max: 89 });
  req.checkBody("email", "Please enter a valid email address").isEmail();

  req.checkBody("password", "Please enter a password").notEmpty();
  req
    .checkBody(
      "password",
      "Please enter a valid password (between 6 and 255 characters)"
    )
    .isLength({ min: 6, max: 255 });

  if (req.body.password) {
    req
      .assert("passwordConfirm", "Passwords do not match")
      .equals(req.body.password);
  }

  var admin = 0;
  var volunteer = 0;

  if (!["admin", "till"].includes(userClass)) {
    userClass = "till";
  }

  var formattedWorkingGroups = [];

  WorkingGroups.getAll(function(err, allWorkingGroups) {
    Object.keys(working_groups).forEach(function(key) {
      if (allWorkingGroups[key]) {
        formattedWorkingGroups.push(key);
      }
    });

    // Parse request's body asynchronously
    req
      .asyncValidationErrors()
      .then(function() {
        var newUser = {
          id: null,
          first_name: first_name,
          last_name: last_name,
          username: username,
          email: email,
          class: userClass,
          working_groups: JSON.stringify(formattedWorkingGroups.sort()),
          password: password,
          passwordConfirm: passwordConfirm
        };

        Users.add(newUser, function(err, user) {
          if (err) throw err;
          user = user[0];
          req.flash("success_msg", "New user added!");
          res.redirect("/users/update/" + user.id);
        });
      })
      .catch(function(errors) {
        res.render("users/add", {
          errors: errors,
          title: "Add User",
          usersActive: true,
          first_name: first_name,
          last_name: last_name,
          username: username,
          email: email,
          class: userClass,
          password: password,
          passwordConfirm: passwordConfirm,
          allWorkingGroups: allWorkingGroups,
          working_groups: working_groups
        });
      });
  });
});

module.exports = router;
