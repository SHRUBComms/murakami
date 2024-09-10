module.exports = (Members, sequelize, DataTypes) => {
  return async (member_id, contactPreferences) => {
    delete contactPreferences.newsletters;
    return Members.update(
      { contactPreferences: contactPreferences },
      { where: { member_id: member_id } }
    );
  };
};
