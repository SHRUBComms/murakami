module.exports = (Models) => {
  (Models.Volunteers.getSignUpInfo = async () => {
    const { roles, rolesObj, rolesByGroup } = await Models.VolunteerRoles.getAll();
    const settings = await Models.Settings.getAll();
    return {
      activities: settings.activities.data,
      contactMethods: settings.contactMethods.data,
      roles,
      rolesByGroup,
      rolesObj,
      volunteerAgreement: settings.volunteerAgreement.data,
      ourVision: settings.ourVision.data,
      saferSpacesPolicy: settings.saferSpacesPolicy.data,
      membershipBenefits: settings.membershipBenefits.data,
      privacyNotice: settings.privacyNotice.data,
      skills: settings.activities.data,
      contactMethods: settings.contactMethods.data,
    };
  }),
    (Models.Members.getSignUpInfo = async () => {
      const settings = await Models.Settings.getAll();
      return {
        ourVision: settings.ourVision.data,
        saferSpacesPolicy: settings.saferSpacesPolicy.data,
        membershipBenefits: settings.membershipBenefits.data,
        privacyNotice: settings.privacyNotice.data,
      };
    }),
    (Models.VolunteerRoles.getRoleSignUpInfo = async () => {
      const settings = await Models.Settings.getAll();
      return {
        locations: settings.locations.data,
        activities: settings.activities.data,
        commitmentLengths: settings.commitmentLengths.data,
      };
    }),
    (Models.Members.redact = async (member_id) => {
      await Models.Members.update(
        {
          first_name: "[redacted]",
          last_name: "[redacted]",
          email: "[redacted]",
          phone_no: "[redacted]",
          address: "[redacted]",
          working_groups: [],
          is_member: 0,
        },
        { where: { member_id: member_id } }
      );

      return Models.Volunteers.update({ roles: [] }, { where: { member_id: member_id } });
    }),
    (Models.Tills.getOpenTill = async (till_id) => {
      try {
        const till = await Models.Tills.getById(till_id);

        if (!till) {
          throw "Till not found";
        }

        if (till.disabled == 1) {
          throw "Till is disabled";
        }

        const status = await Models.TillActivity.getByTillId(till_id);

        if (status.opening != "1") {
          throw "Till is closed";
        }

        till.status = 1;
        till.openingTimestamp = status.timestamp || new Date();
        till.openingFloat = status.counted_float || 0;

        return till;
      } catch (error) {
        throw error;
      }
    });
  return Models;
};
