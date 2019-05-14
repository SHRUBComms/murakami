var async = require("async");
var lodash = require("lodash");
var moment = require("moment");
moment.locale("en-gb");

var Helpers = require(process.env.CWD + "/app/helper-functions/root");

module.exports = function(Users, sequelize, DataTypes) {
  return function(users, loggedInUserObj, callback) {
    var usersObj = {};

    async.eachOf(
      users,
      function(user, i, loopCallback) {
        var sanitizedUser = {};
        var loggedInUser = lodash.clone(loggedInUserObj);
        var isUser = false;

        if (user.id == loggedInUser.id) {
          isUser = true;
          loggedInUser.permissions = {
            users: {
              name: true,
              email: true,
              username: true,
              working_groups: true
            }
          };
        }

        if (user.working_groups) {
          user.working_groups = user.working_groups || [];
        }

        user.full_name = user.first_name + " " + user.last_name;

        if (user.notification_preferences && isUser) {
          user.notification_preferences = user.notification_preferences || {};
        } else {
          user.notification_preferences = {};
        }

        if (!user.lastLogin) {
          user.lastLogin = "Never";
        }

        if (!isUser) {
          delete user.password;
        }

        var commonWorkingGroup = Helpers.hasOneInCommon(
          loggedInUser.working_groups,
          user.working_groups
        );

        try {
          if (
            loggedInUser.permissions.users.name == true ||
            (loggedInUser.permissions.users.name == "commonWorkingGroup" &&
              commonWorkingGroup) ||
            isUser
          ) {
            sanitizedUser.first_name = user.first_name;
            sanitizedUser.last_name = user.last_name;
            sanitizedUser.full_name = user.full_name;
            sanitizedUser.name = user.full_name;
          }
        } catch (err) {}

        try {
          if (
            loggedInUser.permissions.users.email == true ||
            (loggedInUser.permissions.users.email == "commonWorkingGroup" &&
              commonWorkingGroup) ||
            isUser
          ) {
            sanitizedUser.email = user.email;
          }
        } catch (err) {}

        try {
          if (
            loggedInUser.permissions.users.username == true ||
            (loggedInUser.permissions.users.username == "commonWorkingGroup" &&
              commonWorkingGroup) ||
            isUser
          ) {
            sanitizedUser.username = user.username;
          }
        } catch (err) {}

        try {
          if (
            loggedInUser.permissions.users.workingGroups == true ||
            (loggedInUser.permissions.users.workingGroups ==
              "commonWorkingGroup" &&
              commonWorkingGroup) ||
            isUser
          ) {
            sanitizedUser.working_groups = user.working_groups;
          }
        } catch (err) {}

        try {
          if (
            loggedInUser.permissions.users.update == true ||
            (loggedInUser.permissions.users.update == "commonWorkingGroup" &&
              commonWorkingGroup) ||
            isUser
          ) {
            sanitizedUser.canUpdate = true;
          }
        } catch (err) {}

        if (Object.keys(sanitizedUser).length > 0) {
          sanitizedUser.notification_preferences =
            user.notification_preferences || {};
          sanitizedUser.lastLogin = user.lastLogin || "Never";
          sanitizedUser.password = user.password || null;
          sanitizedUser.id = user.id;
          sanitizedUser.class = user.class;
          sanitizedUser.deactivated = user.deactivated;

          if (user.permissions) {
            sanitizedUser.permissions = user.permissions;
          }

          usersObj[user.id] = sanitizedUser;
          users[i] = sanitizedUser;
          loopCallback();
        } else {
          users[i] = {};
          usersObj[user.id] = {};

          loopCallback();
        }
      },
      function() {
        callback(users, usersObj);
      }
    );
  };
};
