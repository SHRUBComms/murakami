module.exports = function(Users, sequelize, DataTypes) {
  return function(user, callback) {
    Users.update(
      {
        first_name: user.first_name,
        last_name: user.last_name,
        class: user.class,
        working_groups: user.working_groups,
        notification_preferences: user.notification_preferences
      },
      { where: { id: user.user_id } }
    ).nodeify(function(err) {
      callback(err);
    });
  };
};
