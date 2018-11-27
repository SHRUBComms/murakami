var Auth = {};

Auth.isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/login");
  }
};

Auth.isOfClass = function(allowedClasses) {
  return function(req, res, next) {
    if (allowedClasses.includes(req.user.class)) {
      return next();
    } else {
      res.redirect("/");
    }
  };
};

module.exports = Auth;
