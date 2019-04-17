// /users/add

var router = require("express").Router();

var rootDir = process.env.CWD;

var Users = require(rootDir + "/app/models/users");

var Auth = require(rootDir + "/app/configs/auth");
var Helpers = require(rootDir + "/app/configs/helpful_functions");

router.get("/", Auth.isLoggedIn, Auth.canAccessPage("users", "add"), function(
  req,
  res
) {
  res.render("users/add", {
    title: "Add User",
    usersActive: true
  });
});

router.post("/", Auth.isLoggedIn, Auth.canAccessPage("users", "add"), function(
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

  var working_groups = req.body.working_groups;
  var notification_preferences = req.body.notification_preferences;

  if (!Array.isArray(working_groups)) {
    working_groups = [working_groups];
  }

  var validClasses, validWorkingGroups;

  if (req.user.class == "admin") {
    validClasses = ["admin", "till", "volunteer", "staff"];
    validWorkingGroups = req.user.allWorkingGroupsFlat;
  } else {
    validClasses = ["till", "volunteer"];
    validWorkingGroups = req.user.working_groups;
  }

  if (!validClasses.includes(userClass)) {
    userClass = null;
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

  req
    .checkBody("working_groups", "Please select at least one working group")
    .notEmpty();

  if (!Helpers.allBelongTo(validWorkingGroups, req.user.allWorkingGroupsFlat)) {
    req
      .checkBody("placeholder", "Please select valid working groups")
      .notEmpty();
  }

  var sanitized_notification_preferences = {
    "pending-volunteer-hours": {
      email: "off",
      murakami: "off"
    },
    "volunteers-need-to-volunteer": {
      email: "off",
      murakami: "off"
    },
    "unfinished-roles": {
      email: "off",
      murakami: "off"
    }
  };

  try {
    if (notification_preferences["pending-volunteer-hours"]["murakami"]) {
      sanitized_notification_preferences["pending-volunteer-hours"][
        "murakami"
      ] = "on";
    }
  } catch (err) {}

  try {
    if (notification_preferences["pending-volunteer-hours"]["email"]) {
      sanitized_notification_preferences["pending-volunteer-hours"]["email"] =
        "on";
    }
  } catch (err) {}

  try {
    if (notification_preferences["volunteers-need-to-volunteer"]["murakami"]) {
      sanitized_notification_preferences["volunteers-need-to-volunteer"][
        "murakami"
      ] = "on";
    }
  } catch (err) {}

  try {
    if (notification_preferences["volunteers-need-to-volunteer"]["email"]) {
      sanitized_notification_preferences["volunteers-need-to-volunteer"][
        "email"
      ] = "on";
    }
  } catch (err) {}

  try {
    if (notification_preferences["unfinished-roles"]["murakami"]) {
      sanitized_notification_preferences["unfinished-roles"]["murakami"] = "on";
    }
  } catch (err) {}

  try {
    if (notification_preferences["unfinished-roles"]["email"]) {
      sanitized_notification_preferences["unfinished-roles"]["email"] = "on";
    }
  } catch (err) {}

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
        working_groups: JSON.stringify(working_groups.sort()),
        notification_preferences: JSON.stringify(
          sanitized_notification_preferences
        ),
        password: password,
        passwordConfirm: passwordConfirm
      };

      Users.add(newUser, function(err, user) {
        if (err) throw err;
        user = user[0];
        req.flash("success_msg", "New user added!");
        res.redirect(process.env.PUBLIC_ADDRESS + "/users/update/" + user.id);
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
        working_groups: working_groups,
        class: userClass,
        password: password,
        notification_preferences: notification_preferences,
        passwordConfirm: passwordConfirm
      });
    });
});

module.exports = router;
