const Models = require(process.env.CWD + "/app/models/sequelize");
const Users = Models.Users;

module.exports = {
  customValidators: {
    isEmailAvailable: function (email) {
      return new Promise(function (resolve, reject) {
        Users.findOne({ where: { email: email } }).nodeify(function (err, user) {
          if (!user && !err) {
            return resolve();
          } else {
            return reject();
          }
        });
      });
    },
    isUsernameAvailable: function (username) {
      return new Promise(function (resolve, reject) {
        Users.findOne({ where: { username: username } }).nodeify(function (err, user) {
          if (!user && !err) {
            return resolve();
          } else {
            return reject();
          }
        });
      });
    },
  },
};
