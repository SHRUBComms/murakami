module.exports = (Members, sequelize, DataType) => {
  return async (member_id, new_working_groups) => {
    return Members.update(
      { working_groups: new_working_groups },
      { where: { member_id: member_id } }
    );
  };
};
