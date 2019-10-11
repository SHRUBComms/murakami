module.exports = function(Models) {
  Models.Volunteers.getSignUpInfo = function(callback) {
    Models.VolunteerRoles.getAll(function(
      err,
      roles,
      rolesGroupedByGroup,
      rolesGroupedById
    ) {
      Models.Settings.getAll(function(err, settings) {
        callback(
          settings.activities,
          settings.contactMethods,
          roles,
          rolesGroupedByGroup,
          rolesGroupedById,
          settings.volunteerAgreement,
          settings.ourVision,
          settings.saferSpacesPolicy,
          settings.membershipBenefits,
          settings.privacyNotice
        );
      });
    });
  };

  Models.Members.getSignUpInfo = function(callback) {
    Models.Settings.getAll(function(err, settings) {
      callback(
        settings.ourVision,
        settings.saferSpacesPolicy,
        settings.membershipBenefits,
        settings.privacyNotice
      );
    });
  };

  Models.VolunteerRoles.getRoleSignUpInfo = function(callback) {
    Models.Settings.getAll(function(err, settings) {
      callback(
        settings.locations,
        settings.activities,
        settings.commitmentLengths
      );
    });
  };

  Models.Members.redact = function(member_id, callback) {
    Models.Members.update(
      {
        first_name: "[redacted]",
        last_name: "[redacted]",
        email: "[redacted]",
        phone_no: "[redacted]",
        address: "[redacted]",
        working_groups: [],
        is_member: 0
      },
      { where: { member_id: member_id } }
    ).nodeify(function(err) {
      if (!err) {
        Models.Volunteers.update(
          { roles: [] },
          { where: { member_id: member_id } }
        ).nodeify(callback);
      } else {
        callback(err);
      }
    });
  };

  return Models;
};
