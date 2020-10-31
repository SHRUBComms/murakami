module.exports = (WorkingGroups, sequelize, DataTypes) => {
  const Helpers = require(process.env.CWD + "/app/helper-functions/root");
  const GetId = async (parent) => {
    let id;
    if (parent) {
      id = parent + "-" + Helpers.generateIntId(3);
    } else {
      id = "WG-" + Helpers.generateIntId(3);
    }
    const result = await WorkingGroups.findAll({ where: { group_id: id } });
    if (result.length > 0) {
      GetId(parent);
    } else if (result.length == 0) {
      return id;
    }
  };
  return GetId;
};
