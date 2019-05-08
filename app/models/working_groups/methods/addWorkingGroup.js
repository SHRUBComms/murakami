module.exports = function(WorkingGroups, sequelize, DataTypes) {
  return function(group, callback) {
    WorkingGroups.generateIntId(group.parent, function(id) {
      WorkingGroups.create({
        group_id: id,
        prefix: group.prefix,
        name: group.name,
        parent: group.parent,
        welcomeMessage: group.welcomeMessage
      }).nodeify(function(err) {
        callback(err, id);
      });
    });
  };
};
