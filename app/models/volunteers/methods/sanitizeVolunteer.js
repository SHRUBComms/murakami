var async = require("async");
var moment = require("moment");
moment.locale("en-gb");
var Helpers = require(process.env.CWD + "/app/configs/helpful_functions");

module.exports = function(Volunteers, sequelize, DataTypes) {
  return function(volInfo, user, callback) {
    var sanitizedVolunteers = [];

    async.eachOf(
      volInfo,
      function(volunteer, index, callback) {
        try {
          if (volunteer.roles.length >= 2) {
            volunteer.dateCreated =
              volunteer.dateCreated ||
              volunteer.firstVolunteered ||
              volunteer.earliest_membership_date;

            volunteer.full_name =
              volunteer.first_name + " " + volunteer.last_name;

            if (volunteer.contactPreferences) {
              try {
                volunteer.contactPreferences = JSON.parse(
                  volunteer.contactPreferences
                );
              } catch (err) {
                volunteer.contactPreferences = {};
              }
            } else {
              volunteer.contactPreferences = {
                donations: true
              };
            }

            if (volunteer.lastVolunteered) {
              volunteer.nextShiftDue = moment(volunteer.lastVolunteered).add(
                3,
                "months"
              );

              if (
                moment(volunteer.lastVolunteered).isBefore(
                  moment().subtract(1, "months")
                )
              ) {
                volunteer.needsToVolunteer = "now";
                volunteer.lastVolunteeredMessage = "needs to volunteer now";
              } else if (
                moment(volunteer.lastVolunteered).isBetween(
                  moment().subtract(1, "months"),
                  moment().subtract(2, "weeks")
                )
              ) {
                volunteer.needsToVolunteer = "soon";
                volunteer.lastVolunteeredMessage = "needs to volunteer soon";
              } else {
                volunteer.needsToVolunteer = false;
              }

              volunteer.lastVolunteered = moment(volunteer.lastVolunteered);
            } else {
              volunteer.nextShiftDue = moment(volunteer.dateCreated).add(
                1,
                "months"
              );

              if (
                moment(volunteer.dateCreated).isBefore(
                  moment().subtract(2, "weeks")
                )
              ) {
                volunteer.needsToVolunteer = "now";
              } else {
                volunteer.needsToVolunteer = "soon";
              }
            }

            if (
              moment(volunteer.lastCheckin || volunteer.dateCreated).isBefore(
                moment().subtract(3, "months")
              )
            ) {
              volunteer.needsToCheckin = "now";
            } else if (
              moment(volunteer.lastCheckin || volunteer.dateCreated).isBetween(
                moment().subtract(3, "months"),
                moment().subtract(2, "months")
              )
            ) {
              volunteer.needsToCheckin = "soon";
            } else {
              volunteer.needsToCheckin = false;
            }

            volunteer.nextCheckinDue = moment(
              volunteer.lastCheckin || volunteer.dateCreated
            ).add(3, "months");

            if (volunteer.lastCheckin) {
              volunteer.lastCheckin = moment(volunteer.lastCheckin);
            }

            if (volunteer.firstVolunteered) {
              volunteer.firstVolunteered = moment(volunteer.firstVolunteered);
            } else {
              volunteer.firstVolunteered = null;
            }

            volunteer.lastUpdated = moment(volunteer.lastUpdated);
            if (volunteer.lastUpdated < moment().diff(-4, "months")) {
              volunteer.needsToUpdate = "now";
            } else if (volunteer.lastUpdated < moment().diff(-6, "months")) {
              volunteer.needsToUpdate = "soon";
            } else {
              volunteer.needsToUpdate = false;
            }

            if (volunteer.roles) {
              try {
                volunteer.roles = JSON.parse(volunteer.roles);
              } catch (err) {
                volunteer.roles = [];
              }
            } else {
              volunteer.roles = [];
            }

            if (volunteer.roles.length > 0) {
              volunteer.active = true;
            } else {
              volunteer.active = false;
            }

            if (volunteer.working_groups) {
              try {
                volunteer.working_groups =
                  JSON.parse(volunteer.working_groups) || [];
              } catch (err) {
                volunteer.working_groups = [];
              }
              if (!Array.isArray(volunteer.working_groups)) {
                volunteer.working_groups = [];
              }
              volunteer.old_working_groups = volunteer.working_groups.slice();
            } else {
              volunteer.working_groups = [];
              volunteer.old_working_groups = [];
            }

            if (volunteer.assignedCoordinators) {
              try {
                volunteer.assignedCoordinators = JSON.parse(
                  volunteer.assignedCoordinators
                );
              } catch (err) {
                volunteer.assignedCoordinators = [];
              }
            } else {
              volunteer.assignedCoordinators = [];
            }

            if (volunteer.survey) {
              try {
                volunteer.survey = JSON.parse(volunteer.survey);
              } catch (err) {
                volunteer.survey = {};
              }
            } else {
              volunteer.survey = {};
            }

            if (volunteer.availability) {
              try {
                volunteer.availability = JSON.parse(volunteer.availability);
              } catch (err) {}
            } else {
              volunteer.availability = {};
            }

            if (volunteer.gdpr) {
              try {
                volunteer.gdpr = JSON.parse(volunteer.gdpr);
              } catch (err) {}
            } else {
              volunteer.gdpr = {};
            }
            volunteer.dateCreated = moment(volunteer.dateCreated);

            async.each(
              volunteer.roles,
              function(role, callback) {
                if (user.allVolunteerRoles) {
                  if (user.allVolunteerRoles[role]) {
                    volunteer.working_groups.push(
                      user.allVolunteerRoles[role].group_id
                    );
                    try {
                      if (
                        user.allWorkingGroupsObj[
                          user.allVolunteerRoles[role].group_id
                        ].parent
                      ) {
                        volunteer.working_groups.push(
                          user.allWorkingGroupsObj[
                            user.allVolunteerRoles[role].group_id
                          ].parent
                        );
                      }
                    } catch (err) {}

                    if (
                      volunteer.working_groups.indexOf(
                        user.allVolunteerRoles[role].group_id
                      ) == -1
                    ) {
                      volunteer.old_working_groups.splice(
                        volunteer.working_groups.indexOf(
                          user.allVolunteerRoles[role].group_id
                        ),
                        1
                      );
                    }
                  }
                }
                callback();
              },
              function() {
                volunteer.working_groups = Array.from(
                  new Set(volunteer.working_groups)
                );

                volunteer.canUpdate = false;

                var sanitizedVolunteer = {};
                var commonWorkingGroup = Helpers.hasOneInCommon(
                  volunteer.working_groups,
                  user.working_groups
                );

                if (
                  user.permissions.volunteers.shiftHistory == true ||
                  (user.permissions.volunteers.shiftHistory ==
                    "commonWorkingGroup" &&
                    commonWorkingGroup)
                ) {
                  sanitizedVolunteer.shiftHistory = true;
                  sanitizedVolunteer.nextShiftDue = volunteer.nextShiftDue;
                  sanitizedVolunteer.needsToVolunteer =
                    volunteer.needsToVolunteer;
                  sanitizedVolunteer.lastVolunteeredMessage =
                    volunteer.lastVolunteeredMessage;
                  sanitizedVolunteer.lastVolunteered =
                    volunteer.lastVolunteered;
                  sanitizedVolunteer.firstVolunteered =
                    volunteer.firstVolunteered;
                }

                if (
                  user.permissions.volunteers.conductCheckIn == true ||
                  (user.permissions.volunteers.conductCheckIn ==
                    "commonWorkingGroup" &&
                    commonWorkingGroup)
                ) {
                  sanitizedVolunteer.conductCheckIn = true;
                  sanitizedVolunteer.checkin_id = volunteer.checkin_id;
                  sanitizedVolunteer.needsToCheckin = volunteer.needsToCheckin;
                  sanitizedVolunteer.nextCheckinDue = volunteer.nextCheckinDue;
                  sanitizedVolunteer.lastCheckin = volunteer.lastCheckin;
                }

                if (
                  user.permissions.volunteers.dates == true ||
                  (user.permissions.volunteers.dates == "commonWorkingGroup" &&
                    commonWorkingGroup)
                ) {
                  sanitizedVolunteer.dateCreated = volunteer.dateCreated;
                  sanitizedVolunteer.lastUpdated = volunteer.lastUpdated;
                  sanitizedVolunteer.needsToUpdate = volunteer.needsToUpdate;
                }

                if (
                  user.permissions.volunteers.roles == true ||
                  (user.permissions.volunteers.roles == "commonWorkingGroup" &&
                    commonWorkingGroup)
                ) {
                  sanitizedVolunteer.roles = volunteer.roles;
                }

                if (
                  user.permissions.volunteers.assignedCoordinators == true ||
                  (user.permissions.volunteers.assignedCoordinators ==
                    "commonWorkingGroup" &&
                    commonWorkingGroup)
                ) {
                  sanitizedVolunteer.assignedCoordinators =
                    volunteer.assignedCoordinators;
                }

                if (
                  user.permissions.volunteers.availability == true ||
                  (user.permissions.volunteers.availability ==
                    "commonWorkingGroup" &&
                    commonWorkingGroup)
                ) {
                  sanitizedVolunteer.availability = volunteer.availability;
                }

                if (
                  user.permissions.volunteers.survey == true ||
                  (user.permissions.volunteers.survey == "commonWorkingGroup" &&
                    commonWorkingGroup)
                ) {
                  sanitizedVolunteer.survey = volunteer.survey;
                }

                if (
                  user.permissions.volunteers.emergencyContact == true ||
                  (user.permissions.volunteers.emergencyContact ==
                    "commonWorkingGroup" &&
                    commonWorkingGroup)
                ) {
                  sanitizedVolunteer.emergencyContactName =
                    volunteer.emergencyContactName;
                  sanitizedVolunteer.emergencyContactRelation =
                    volunteer.emergencyContactRelation;
                  sanitizedVolunteer.emergencyContactPhoneNo =
                    volunteer.emergencyContactPhoneNo;
                }

                if (
                  user.permissions.volunteers.update == true ||
                  (user.permissions.volunteers.update == "commonWorkingGroup" &&
                    commonWorkingGroup)
                ) {
                  sanitizedVolunteer.canUpdate = true;
                }

                try {
                  if (
                    user.permissions.members.name == true ||
                    (user.permissions.members.name == "commonWorkingGroup" &&
                      commonWorkingGroup)
                  ) {
                    sanitizedVolunteer.first_name = volunteer.first_name;
                    sanitizedVolunteer.last_name = volunteer.last_name;
                    sanitizedVolunteer.name =
                      member.first_name + " " + member.last_name;
                    sanitizeVolunteer.name =
                      member.first_name + " " + member.last_name;
                  }
                } catch (err) {}

                try {
                  if (
                    user.permissions.members.membershipDates == true ||
                    (user.permissions.members.membershipDates ==
                      "commonWorkingGroup" &&
                      commonWorkingGroup)
                  ) {
                    sanitizedVolunteer.current_exp_membership =
                      member.current_exp_membership;
                    sanitizedVolunteer.current_init_membership =
                      member.current_init_membership;
                    sanitizedVolunteer.earliest_membership_date =
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
                    sanitizedVolunteer.email = volunteer.email;
                    sanitizedVolunteer.phone_no = volunteer.phone_no;
                    sanitizedVolunteer.address = volunteer.address;
                  }
                } catch (err) {}

                try {
                  if (
                    user.permissions.members.balance == true ||
                    (user.permissions.members.balance == "commonWorkingGroup" &&
                      commonWorkingGroup)
                  ) {
                    sanitizedVolunteer.balance = volunteer.balance;
                  }
                } catch (err) {}

                try {
                  if (
                    user.permissions.members.workingGroups == true ||
                    (user.permissions.members.workingGroups ==
                      "commonWorkingGroup" &&
                      commonWorkingGroup)
                  ) {
                    sanitizedVolunteer.working_groups =
                      volunteer.working_groups;
                  }
                } catch (err) {}

                try {
                  if (
                    user.permissions.members.carbonSaved == true ||
                    (user.permissions.members.carbonSaved ==
                      "commonWorkingGroup" &&
                      commonWorkingGroup)
                  ) {
                    sanitizedVolunteer.canViewSavedCarbon = true;
                  }
                } catch (err) {}

                try {
                  if (
                    user.permissions.members.transactionHistory == true ||
                    (user.permissions.members.transactionHistory ==
                      "commonWorkingGroup" &&
                      commonWorkingGroup)
                  ) {
                    sanitizedVolunteer.transactionHistory = true;
                  }
                } catch (err) {}

                try {
                  if (
                    user.permissions.volunteers.view == true ||
                    (user.permissions.volunteers.view == "commonWorkingGroup" &&
                      commonWorkingGroup &&
                      member.volunteer_id)
                  ) {
                    sanitizedVolunteer.volunteer_id = volunteer.volunteer_id;
                  }
                } catch (err) {}

                try {
                  if (
                    user.permissions.members.update == true ||
                    (user.permissions.members.update == "commonWorkingGroup" &&
                      commonWorkingGroup)
                  ) {
                    sanitizedVolunteer.canUpdate = true;
                  }
                } catch (err) {}

                try {
                  if (
                    user.permissions.members.canRevokeMembership == true ||
                    (user.permissions.members.canRevokeMembership ==
                      "commonWorkingGroup" &&
                      commonWorkingGroup)
                  ) {
                    sanitizedVolunteer.canRevokeMembership = true;
                  }
                } catch (err) {}
                try {
                  if (
                    user.permissions.members.delete == true ||
                    (user.permissions.members.delete == "commonWorkingGroup" &&
                      commonWorkingGroup)
                  ) {
                    sanitizedVolunteer.canDelete = true;
                  }
                } catch (err) {}
                try {
                  if (
                    user.permissions.members.manageMembershipCard == true ||
                    (user.permissions.members.manageMembershipCard ==
                      "commonWorkingGroup" &&
                      commonWorkingGroup)
                  ) {
                    sanitizedVolunteer.canManageMembershipCard = true;
                  }
                } catch (err) {}

                if (Object.keys(sanitizedVolunteer).length > 0) {
                  if (sanitizedVolunteer.roles.length > 0) {
                    sanitizedVolunteer.active = true;
                  } else {
                    sanitizedVolunteer.active = false;
                  }
                  sanitizedVolunteer.working_groups = volunteer.working_groups;
                  sanitizedVolunteer.member_id = volunteer.member_id;
                  sanitizedVolunteer.gdpr = volunteer.gdpr;

                  if (volunteer.assignedCoordinators.includes(user.id)) {
                    sanitizedVolunteer.isAssignedCoordinator = true;
                  }

                  sanitizedVolunteers.push(sanitizedVolunteer);
                }

                callback();
              }
            );
          } else {
            callback();
          }
        } catch (err) {
          callback();
        }
      },
      function() {
        callback(sanitizedVolunteers);
      }
    );
  };
};
