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

  return Models;
};
