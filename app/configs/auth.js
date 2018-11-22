var Auth = {};

Auth.isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/login");
  }
};

Auth.isVolunteer = function(req, res, next) {
  if (req.user.volunteer == 1) {
    return next();
  } else {
    res.redirect("/");
  }
};

Auth.isAdmin = function(req, res, next) {
  if (req.user.admin == 1) {
    return next();
  } else {
    res.redirect("/");
  }
};

Auth.isVolunteerOrAdmin = function(req, res, next) {
  if (req.user.volunteer == 1 || req.user.admin == 1) {
    return next();
  } else {
    res.redirect("/");
  }
};

module.exports = Auth;
