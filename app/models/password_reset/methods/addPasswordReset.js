module.exports = (PasswordReset, sequelize, DataTypes) => {
  return async (user_id, ip_address) => {
    const resetCode = await PasswordReset.generateResetCode();
    return PasswordReset.create({
      user_id: user_id,
      ip_address: ip_address,
      reset_code: resetCode,
      date_issued: new Date(),
      used: 0,
    });
  };
};
