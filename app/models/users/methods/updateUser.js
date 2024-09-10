module.exports = (Users, sequelize, DataTypes) => {
  return async (user) => {
    return Users.update(
      {
        first_name: user.first_name,
        last_name: user.last_name,
        class: user.class,
        working_groups: user.working_groups,
        notification_preferences: user.notification_preferences,
      },
      { where: { id: user.user_id } }
    );
  };
};
