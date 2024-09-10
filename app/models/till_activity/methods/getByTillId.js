module.exports = (TillActivity, sequelize, DataTypes) => {
  return async (till_id, callback) => {
    try {
      const lastAction = await TillActivity.findOne({
        where: { till_id: till_id },
        order: [["timestamp", "DESC"]],
      });

      if (lastAction) {
        return lastAction;
      } else {
        return { opening: 0 };
      }
    } catch (error) {
      throw error;
    }
  };
};
