const async = require("async");
const lodash = require("lodash");

const Helpers = require(process.env.CWD + "/app/controllers/helper-functions/root");

module.exports = (Users, sequelize, DataTypes) => {
  return async (users, loggedInUserObj) => {
    const usersObj = {};
    const sanitizedUsers = [];

    for await (const user of users) {
      const sanitizedUser = {};
      const loggedInUser = lodash.clone(loggedInUserObj);
      let isUser = false;

      if (user.id == loggedInUser.id) {
        isUser = true;
        loggedInUser.permissions = {
          users: {
            name: true,
            email: true,
            username: true,
            working_groups: true,
          },
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

      if (!isUser) {
        delete user.password;
      }

      const commonWorkingGroup = Helpers.hasOneInCommon(
        loggedInUser.working_groups,
        user.working_groups
      );

      try {
        if (
          loggedInUser.permissions.users.name == true ||
          (loggedInUser.permissions.users.name == "commonWorkingGroup" && commonWorkingGroup) ||
          isUser
        ) {
          sanitizedUser.first_name = user.first_name;
          sanitizedUser.last_name = user.last_name;
          sanitizedUser.full_name = user.full_name;
          sanitizedUser.name = user.full_name;
        }
      } catch (error) {}

      try {
        if (
          loggedInUser.permissions.users.email == true ||
          (loggedInUser.permissions.users.email == "commonWorkingGroup" && commonWorkingGroup) ||
          isUser
        ) {
          sanitizedUser.email = user.email;
        }
      } catch (error) {}

      try {
        if (
          loggedInUser.permissions.users.username == true ||
          (loggedInUser.permissions.users.username == "commonWorkingGroup" && commonWorkingGroup) ||
          isUser
        ) {
          sanitizedUser.username = user.username;
        }
      } catch (error) {}

      try {
        if (
          loggedInUser.permissions.users.workingGroups == true ||
          (loggedInUser.permissions.users.workingGroups == "commonWorkingGroup" &&
            commonWorkingGroup) ||
          isUser
        ) {
          sanitizedUser.working_groups = user.working_groups;
        }
      } catch (error) {}

      try {
        if (
          loggedInUser.permissions.users.update == true ||
          (loggedInUser.permissions.users.update == "commonWorkingGroup" && commonWorkingGroup) ||
          isUser
        ) {
          sanitizedUser.canUpdate = true;
        }
      } catch (error) {}

      try {
        if (
          loggedInUser.permissions.users.deactivate == true ||
          (loggedInUser.permissions.users.deactivate == "commonWorkingGroup" &&
            commonWorkingGroup) ||
          isUser
        ) {
          sanitizedUser.canDeactivate = true;
        }
      } catch (error) {}

      if (Object.keys(sanitizedUser).length > 0) {
        sanitizedUser.notification_preferences = user.notification_preferences || {};
        sanitizedUser.lastLogin = user.lastLogin;
        sanitizedUser.password = user.password || null;
        sanitizedUser.id = user.id;
        sanitizedUser.class = user.class;
        sanitizedUser.deactivated = user.deactivated;

        if (user.permissions) {
          sanitizedUser.permissions = user.permissions;
        }

        usersObj[user.id] = sanitizedUser;
        sanitizedUsers.push(sanitizedUser);
      }
    }

    return sanitizedUsers;
  };
};
