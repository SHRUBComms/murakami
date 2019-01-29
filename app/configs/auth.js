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

// TEMPORARY
Auth.verifyByKey = function(req, res, next) {

  if(req.query.key){
    if (req.query.key === process.env.TEMPORARY_API_KEY) {
      return next();
    } else {
      res.send({ message: "Permission denied" });
    }
  } else {
    res.send({ message: "Permission denied" });
  }
};

module.exports = Auth;
