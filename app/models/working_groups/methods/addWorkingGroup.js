module.exports = (WorkingGroups, sequelize, DataTypes) => {
  return async (group) => {
    const id = await WorkingGroups.generateId(group.parent);
    await WorkingGroups.create({
      group_id: id,
      prefix: group.prefix,
      name: group.name,
      parent: group.parent,
      welcomeMessage: group.welcomeMessage,
    });
    return id;
  };
};
