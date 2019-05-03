module.exports = function(Users, sequelize, DataTypes) {
  return function(user_id, working_groups, callback) {
    Users.update(
      { working_groups: working_groups },
      { where: { id: user_id } }
    ).nodeify(function(err) {
      callback(err);
    });
  };
};
