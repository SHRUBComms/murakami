module.exports = (Settings, sequelize, DataTypes) => {
  return async () => {
    try {
      const rawStaticContent = await Settings.findAll({
        raw: true,
        where: {
          id: {
            [DataTypes.Op.or]: [
              "membershipBenefits",
              "saferSpacesPolicy",
              "volunteerAgreement",
              "ourVision",
              "privacyNotice",
              "activities",
              "commitmentLengths",
              "contactMethods",
              "locations",
              "refundPolicy",
            ],
          },
        },
      });

      const staticContent = { lists: {}, texts: {} };

      const validTexts = [
        "membershipBenefits",
        "saferSpacesPolicy",
        "volunteerAgreement",
        "ourVision",
        "privacyNotice",
        "refundPolicy",
      ];

      const validLists = ["activities", "commitmentLengths", "contactMethods", "locations"];

      for await (const setting of rawStaticContent) {
        if (validTexts.includes(setting.id)) {
          staticContent.texts[setting.id] = setting;
        } else if (validLists.includes(setting.id)) {
          staticContent.lists[setting.id] = setting;
        }
      }

      return staticContent;
    } catch (error) {
      throw error;
    }
  };
};
