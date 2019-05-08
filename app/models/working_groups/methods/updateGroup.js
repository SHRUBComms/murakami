module.exports = function(WorkingGroups, sequelize, DataTypes) {
  return function(group, callback) {
    WorkingGroups.update(
      {
        prefix: group.prefix,
        name: group.name,
        parent: group.parent,
        welcomeMessage: group.welcomeMessage
      },
      { where: { group_id: group.group_id } }
    ).nodeify(function(err) {
      callback(err);
    });
  };
};
