module.exports = (WorkingGroups, sequelize, DataTypes) => {
  return async (group) => {
    return WorkingGroups.update(
      {
        prefix: group.prefix,
        name: group.name,
        parent: group.parent,
        welcomeMessage: group.welcomeMessage
      },
      { where: { group_id: group.group_id } }
    );
  }
};
