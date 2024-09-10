const bcrypt = require("bcrypt-nodejs");

module.exports = (Users, sequelize, DataTypes) => {
  return async (user_id, password) => {
    try {
      const query = "UPDATE login SET password = ? WHERE id = ?";
      const salt = await bcrypt.genSaltSync(10);
      const hash = await bcrypt.hashSync(password, salt);

      password = hash.replace(/^\$2y(.+)$/i, "$2a$1"); // Convert hash format (hangover from original user database)
      return Users.update({ password: password }, { where: { id: user_id } });
    } catch (error) {
      throw error;
    }
  };
};
