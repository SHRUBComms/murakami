module.exports = function(Members, sequelize, DataTypes) {
  return function(member_id, contactPreferences, callback) {
    delete contactPreferences.newsletters;

    Members.update(
      { contactPreferences: JSON.stringify(contactPreferences) },
      { where: { member_id: member_id } }
    ).nodeify(callback);
  };
};
