module.exports = (Users, sequelize, DataTypes) => {
  return async (user_id, callback) => {
    return Users.update({ deactivated: 1 }, { where: { id: user_id } });
  };
};
