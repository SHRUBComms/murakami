module.exports = (PasswordReset, sequelize, DataTypes) => {
  const Helpers = require(process.env.CWD + "/app/controllers/helper-functions/root");
  const GetId = async () => {
    const resetCode = Helpers.generateBase64Id(25);
    const result = await PasswordReset.findAll({ where: { reset_code: resetCode } });
    if (result.length > 0) {
      GetId();
    } else if (result.length == 0) {
      return resetCode;
    }
  };

  return GetId;
};
