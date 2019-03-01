var customValidators = {
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

module.exports = customValidators;
