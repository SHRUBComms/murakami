module.exports = (Members, sequelize, DataTypes) => {
  const Helpers = require(process.env.CWD + "/app/controllers/helper-functions/root");
  const GetId = async () => {
    const memberId = Helpers.generateIntId(11);
    const result = await Members.findAll({ where: { member_id: memberId } });
    if (result.length > 0) {
      GetId();
    } else if (result.length == 0) {
      return memberId;
    }
  };
  return GetId;
};
