module.exports = (DataPermissions, sequelize, DataTypes) => {
  return async (userClass, permissions) => {
    return DataPermissions.update({ permissions: permissions }, { where: { class: userClass } });
  };
};
