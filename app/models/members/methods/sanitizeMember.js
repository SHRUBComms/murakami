var async = require("async");
var Helpers = require(process.env.CWD + "/app/helper-functions/root");

module.exports = function(Members, sequelize, DataType) {
  return function(member, user, callback) {
    var sanitizedMember = {};

    if (!user.permissions) {
      user.permissions = {};
    } else {
      if (!user.permissions.members) {
        user.permissions.members = {};
      }

      if (!user.permissions.volunteers) {
        user.permissions.volunteers = {};
      }
    }

    if (member) {
      member.full_name = member.first_name + " " + member.last_name;

      if (!member.working_groups) {
        member.working_groups = [];
      }

      if (!member.roles) {
        member.roles = [];
      }

      if (!member.contactPreferences) {
        member.contactPreferences = {
          donations: true
        };
      }

      if (!member.gdpr) {
        member.gdpr = {};
      }

      try {
        if (member.current_exp_membership == "01/01/9999") {
          member.current_exp_membership = "never";
        }
      } catch (err) {}

      async.each(
        member.roles,
        function(role, callback) {
          if (user.allVolunteerRoles) {
            try {
              if (user.allVolunteerRoles[role]) {
                member.working_groups.push(
                  user.allVolunteerRoles[role].group_id
                );
              }
            } catch (err) {
              member.working_groups = [user.allVolunteerRoles[role].group_id];
            }
          }
          callback();
        },
        function() {
          member.working_groups = Array.from(new Set(member.working_groups));

          var commonWorkingGroup = Helpers.hasOneInCommon(
            member.working_groups,
            user.working_groups
          );

          try {
            if (
              user.permissions.members.name == true ||
              (user.permissions.members.name == "commonWorkingGroup" &&
                commonWorkingGroup)
            ) {
              sanitizedMember.first_name = member.first_name;
              sanitizedMember.last_name = member.last_name;
              sanitizedMember.name = member.first_name + " " + member.last_name;
            }
          } catch (err) {}

          try {
            if (
              user.permissions.members.membershipDates == true ||
              (user.permissions.members.membershipDates ==
                "commonWorkingGroup" &&
                commonWorkingGroup)
            ) {
              sanitizedMember.current_exp_membership =
                member.current_exp_membership;
              sanitizedMember.current_init_membership =
                member.current_init_membership;
              sanitizedMember.earliest_membership_date =
                member.earliest_membership_date;
            }
          } catch (err) {}

          try {
            if (
              user.permissions.members.contactDetails == true ||
              (user.permissions.members.contactDetails ==
                "commonWorkingGroup" &&
                commonWorkingGroup)
            ) {
              sanitizedMember.email = member.email;
              sanitizedMember.phone_no = member.phone_no;
              sanitizedMember.address = member.address;
            }
          } catch (err) {}

          try {
            if (
              user.permissions.members.manageMembershipCard == true ||
              (user.permissions.members.manageMembershipCard ==
                "commonWorkingGroup" &&
                commonWorkingGroup)
            ) {
              sanitizedMember.barcode = member.barcode;
            }
          } catch (err) {}

          try {
            if (
              user.permissions.members.balance == true ||
              (user.permissions.members.balance == "commonWorkingGroup" &&
                commonWorkingGroup)
            ) {
              sanitizedMember.balance = member.balance;
            }
          } catch (err) {}

          try {
            if (
              user.permissions.members.workingGroups == true ||
              (user.permissions.members.workingGroups == "commonWorkingGroup" &&
                commonWorkingGroup)
            ) {
              sanitizedMember.working_groups = member.working_groups;
            }
          } catch (err) {}

          try {
            if (
              user.permissions.members.carbonSaved == true ||
              (user.permissions.members.carbonSaved == "commonWorkingGroup" &&
                commonWorkingGroup)
            ) {
              sanitizedMember.canViewSavedCarbon = true;
            }
          } catch (err) {}

          try {
            if (
              user.permissions.members.transactionHistory == true ||
              (user.permissions.members.transactionHistory ==
                "commonWorkingGroup" &&
                commonWorkingGroup)
            ) {
              sanitizedMember.transactionHistory = true;
            }
          } catch (err) {}

          try {
            if (
              user.permissions.volunteers.view == true ||
              (user.permissions.volunteers.view == "commonWorkingGroup" &&
                commonWorkingGroup &&
                member.volunteer_id)
            ) {
              sanitizedMember.volunteer_id = member.volunteer_id;
            }
          } catch (err) {}

          try {
            if (
              user.permissions.members.update == true ||
              (user.permissions.members.update == "commonWorkingGroup" &&
                commonWorkingGroup)
            ) {
              sanitizedMember.canUpdate = true;
            }
          } catch (err) {}

          try {
            if (
              user.permissions.members.canRevokeMembership == true ||
              (user.permissions.members.canRevokeMembership ==
                "commonWorkingGroup" &&
                commonWorkingGroup)
            ) {
              sanitizedMember.canRevokeMembership = true;
            }
          } catch (err) {}
          try {
            if (
              user.permissions.members.delete == true ||
              (user.permissions.members.delete == "commonWorkingGroup" &&
                commonWorkingGroup)
            ) {
              sanitizedMember.canDelete = true;
            }
          } catch (err) {}
          try {
            if (
              user.permissions.members.manageMembershipCard == true ||
              (user.permissions.members.manageMembershipCard ==
                "commonWorkingGroup" &&
                commonWorkingGroup)
            ) {
              sanitizedMember.canManageMembershipCard = true;
            }
          } catch (err) {}

          if (Object.keys(sanitizedMember).length > 0) {
            if (member.activeVolunteer) {
              sanitizedMember.activeVolunteer = true;
            }

            if (member.membership_type) {
              sanitizedMember.membership_type = member.membership_type;
            }

            sanitizedMember.member_id = member.member_id;
            sanitizedMember.is_member = member.is_member;
            sanitizedMember.free = member.free;
            sanitizedMember.gdpr = member.gdpr;
            sanitizedMember.contactPreferences = member.contactPreferences;
          } else {
            sanitizedMember = null;
          }

          callback(null, sanitizedMember);
        }
      );
    } else {
      callback(null, null);
    }
  };
};
