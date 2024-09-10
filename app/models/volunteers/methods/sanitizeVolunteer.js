const moment = require("moment");
moment.locale("en-gb");

const rootDir = process.env.CWD;

const Helpers = require(rootDir + "/app/controllers/helper-functions/root");

module.exports = () => {
  return async (volInfo, user) => {
    const sanitizedVolunteers = [];

    for await (const volunteer of volInfo) {
      if (volunteer) {
        if (volunteer.roles) {
          if (volunteer.roles.length >= 1) {
            volunteer.dateCreated =
              volunteer.dateCreated ||
              volunteer.firstVolunteered ||
              volunteer.earliest_membership_date;

            volunteer.full_name = volunteer.first_name + " " + volunteer.last_name;

            if (!volunteer.contactPreferences) {
              volunteer.contactPreferences = {
                donations: true,
              };
            }

            if (volunteer.lastVolunteered) {
              volunteer.nextShiftDue = moment(volunteer.lastVolunteered).add(3, "months");

              if (moment(volunteer.lastVolunteered).isBefore(moment().subtract(1, "months"))) {
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
              volunteer.nextShiftDue = moment(volunteer.dateCreated).add(1, "months");

              if (moment(volunteer.dateCreated).isBefore(moment().subtract(2, "weeks"))) {
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

            volunteer.nextCheckinDue = moment(volunteer.lastCheckin || volunteer.dateCreated).add(
              3,
              "months"
            );

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

            if (!volunteer.roles) {
              volunteer.roles = [];
            }

            if (volunteer.roles.length > 0) {
              volunteer.formatted_roles = "<ul>";
            } else {
              volunteer.formatted_roles = "No assigned roles.";
            }

            if (volunteer.roles.length > 0) {
              volunteer.active = true;
            } else {
              volunteer.active = false;
            }

            volunteer.wg_summary = " ";

            if (volunteer.working_groups) {
              volunteer.working_groups = volunteer.working_groups || [];

              if (!Array.isArray(volunteer.working_groups)) {
                volunteer.working_groups = [];
              }
              volunteer.old_working_groups = volunteer.working_groups.slice();
            } else {
              volunteer.working_groups = [];
              volunteer.old_working_groups = [];
            }

            if (!volunteer.assignedCoordinators) {
              volunteer.assignedCoordinators = [];
            }

            if (!volunteer.survey) {
              volunteer.survey = {};
            }

            if (!volunteer.availability) {
              volunteer.availability = {};
            }

            if (!volunteer.gdpr) {
              volunteer.gdpr = {};
            }

            volunteer.dateCreated = moment(volunteer.dateCreated);

            for await (const role of volunteer.roles) {
              if (user.allVolunteerRoles) {
                if (user.allVolunteerRoles[role]) {
                  volunteer.formatted_roles +=
                    "<li><p><b>" + user.allVolunteerRoles[role].details.title + "</b>";

                  if (
                    user.allVolunteerRoles[role].public == 1 &&
                    user.allVolunteerRoles[role].removed == 0
                  ) {
                    volunteer.formatted_roles +=
                      " - <a href='https://www.shrubcoop.org/volunteer/view/?roleId=" +
                      role +
                      "'>view role details</a></p>";
                  } else {
                    volunteer.formatted_roles += "</p>";
                  }

                  if (user.allVolunteerRoles[role].details.short_description) {
                    volunteer.formatted_roles +=
                      "<p>" + user.allVolunteerRoles[role].details.short_description + "</p></li>";
                  } else {
                    volunteer.formatted_roles += "</li>";
                  }

                  if (
                    user.allWorkingGroupsObj[user.allVolunteerRoles[role].group_id] &&
                    !volunteer.working_groups.includes(user.allVolunteerRoles[role].group_id)
                  ) {
                    if (
                      user.allWorkingGroupsObj[user.allVolunteerRoles[role].group_id].welcomeMessage
                    ) {
                      volunteer.wg_summary +=
                        "<p><b>" +
                        user.allWorkingGroupsObj[user.allVolunteerRoles[role].group_id].name +
                        "</b></p>";
                      volunteer.wg_summary +=
                        "<div>" +
                        user.allWorkingGroupsObj[user.allVolunteerRoles[role].group_id]
                          .welcomeMessage +
                        "</div>";
                    }
                  }

                  volunteer.working_groups.push(user.allVolunteerRoles[role].group_id);

                  try {
                    if (user.allWorkingGroupsObj[user.allVolunteerRoles[role].group_id].parent) {
                      volunteer.working_groups.push(
                        user.allWorkingGroupsObj[user.allVolunteerRoles[role].group_id].parent
                      );
                    }
                  } catch (error) {}

                  if (
                    volunteer.working_groups.indexOf(user.allVolunteerRoles[role].group_id) == -1
                  ) {
                    volunteer.old_working_groups.splice(
                      volunteer.working_groups.indexOf(user.allVolunteerRoles[role].group_id),
                      1
                    );
                  }
                }
              }
            }

            volunteer.formatted_roles += "</ul>";

            volunteer.working_groups = Array.from(new Set(volunteer.working_groups));

            volunteer.canUpdate = false;

            const sanitizedVolunteer = {};

            const commonWorkingGroup = Helpers.hasOneInCommon(
              volunteer.working_groups,
              user.working_groups
            );

            const isCoordinator = volunteer.assignedCoordinators.includes(user.id);

            if (
              user.permissions.volunteers.shiftHistory == true ||
              (user.permissions.volunteers.shiftHistory == "commonWorkingGroup" &&
                commonWorkingGroup) ||
              (user.permissions.volunteers.shiftHistory == "isCoordinator" && isCoordinator)
            ) {
              sanitizedVolunteer.shiftHistory = true;
              sanitizedVolunteer.nextShiftDue = volunteer.nextShiftDue;
              sanitizedVolunteer.needsToVolunteer = volunteer.needsToVolunteer;
              sanitizedVolunteer.lastVolunteeredMessage = volunteer.lastVolunteeredMessage;
              sanitizedVolunteer.lastVolunteered = volunteer.lastVolunteered;
              sanitizedVolunteer.firstVolunteered = volunteer.firstVolunteered;
            }

            if (
              user.permissions.volunteers.conductCheckIn == true ||
              (user.permissions.volunteers.conductCheckIn == "commonWorkingGroup" &&
                commonWorkingGroup) ||
              (user.permissions.volunteers.conductCheckIn == "isCoordinator" && isCoordinator)
            ) {
              sanitizedVolunteer.conductCheckIn = true;
              sanitizedVolunteer.checkin_id = volunteer.checkin_id;
              sanitizedVolunteer.needsToCheckin = volunteer.needsToCheckin;
              sanitizedVolunteer.nextCheckinDue = volunteer.nextCheckinDue;
              sanitizedVolunteer.lastCheckin = volunteer.lastCheckin;
            }

            if (
              user.permissions.volunteers.dates == true ||
              (user.permissions.volunteers.dates == "commonWorkingGroup" && commonWorkingGroup) ||
              (user.permissions.volunteers.dates == "isCoordinator" && isCoordinator)
            ) {
              sanitizedVolunteer.dateCreated = volunteer.dateCreated;
              sanitizedVolunteer.lastUpdated = volunteer.lastUpdated;
              sanitizedVolunteer.needsToUpdate = volunteer.needsToUpdate;
            }

            if (
              user.permissions.volunteers.roles == true ||
              (user.permissions.volunteers.roles == "commonWorkingGroup" && commonWorkingGroup) ||
              (user.permissions.volunteers.roles == "isCoordinator" && isCoordinator)
            ) {
              sanitizedVolunteer.roles = volunteer.roles;
              sanitizedVolunteer.formatted_roles = volunteer.formatted_roles;
              sanitizedVolunteer.wg_summary = volunteer.wg_summary;
            }

            if (
              user.permissions.volunteers.assignedCoordinators == true ||
              (user.permissions.volunteers.assignedCoordinators == "commonWorkingGroup" &&
                commonWorkingGroup) ||
              (user.permissions.volunteers.assignedCoordinators == "isCoordinator" && isCoordinator)
            ) {
              sanitizedVolunteer.assignedCoordinators = volunteer.assignedCoordinators;
            }

            if (
              user.permissions.volunteers.availability == true ||
              (user.permissions.volunteers.availability == "commonWorkingGroup" &&
                commonWorkingGroup) ||
              (user.permissions.volunteers.availability == "isCoordinator" && isCoordinator)
            ) {
              sanitizedVolunteer.availability = volunteer.availability;
            }

            if (
              user.permissions.volunteers.survey == true ||
              (user.permissions.volunteers.survey == "commonWorkingGroup" && commonWorkingGroup) ||
              (user.permissions.volunteers.survey == "isCoordinator" && isCoordinator)
            ) {
              sanitizedVolunteer.survey = volunteer.survey;
            }

            if (
              user.permissions.volunteers.emergencyContact == true ||
              (user.permissions.volunteers.emergencyContact == "commonWorkingGroup" &&
                commonWorkingGroup) ||
              (user.permissions.volunteers.emergencyContact == "isCoordinator" && isCoordinator)
            ) {
              sanitizedVolunteer.emergencyContactName = volunteer.emergencyContactName;
              sanitizedVolunteer.emergencyContactRelation = volunteer.emergencyContactRelation;
              sanitizedVolunteer.emergencyContactPhoneNo = volunteer.emergencyContactPhoneNo;
            }

            if (
              user.permissions.volunteers.update == true ||
              (user.permissions.volunteers.update == "commonWorkingGroup" && commonWorkingGroup) ||
              (user.permissions.volunteers.update == "isCoordinator" && isCoordinator)
            ) {
              sanitizedVolunteer.canUpdate = true;
            }

            try {
              if (
                user.permissions.members.name == true ||
                (user.permissions.members.name == "commonWorkingGroup" && commonWorkingGroup) ||
                (user.permissions.members.name == "isCoordinator" && isCoordinator)
              ) {
                sanitizedVolunteer.first_name = volunteer.first_name;
                sanitizedVolunteer.last_name = volunteer.last_name;
                sanitizedVolunteer.name = member.first_name + " " + member.last_name;
                sanitizeVolunteer.name = member.first_name + " " + member.last_name;
              }
            } catch (error) {}

            try {
              if (
                user.permissions.members.membershipDates == true ||
                (user.permissions.members.membershipDates == "commonWorkingGroup" &&
                  commonWorkingGroup) ||
                (user.permissions.members.membershipDates == "isCoordinator" && isCoordinator)
              ) {
                sanitizedVolunteer.current_exp_membership = member.current_exp_membership;
                sanitizedVolunteer.current_init_membership = member.current_init_membership;
                sanitizedVolunteer.earliest_membership_date = member.earliest_membership_date;
              }
            } catch (err) {}

            try {
              if (
                user.permissions.members.contactDetails == true ||
                (user.permissions.members.contactDetails == "commonWorkingGroup" &&
                  commonWorkingGroup) ||
                (user.permissions.members.contactDetails == "isCoordinator" && isCoordinator)
              ) {
                sanitizedVolunteer.email = volunteer.email;
                sanitizedVolunteer.phone_no = volunteer.phone_no;
                sanitizedVolunteer.address = volunteer.address;
              }
            } catch (error) {}

            try {
              if (
                user.permissions.members.balance == true ||
                (user.permissions.members.balance == "commonWorkingGroup" && commonWorkingGroup) ||
                (user.permissions.members.balance == "isCoordinator" && isCoordinator)
              ) {
                sanitizedVolunteer.balance = volunteer.balance;
              }
            } catch (error) {}

            try {
              if (
                user.permissions.members.workingGroups == true ||
                (user.permissions.members.workingGroups == "commonWorkingGroup" &&
                  commonWorkingGroup) ||
                (user.permissions.members.workingGroups == "isCoordinator" && isCoordinator)
              ) {
                sanitizedVolunteer.working_groups = volunteer.working_groups;
                sanitizedVolunteer.old_working_groups = volunteer.old_working_groups || [];
              }
            } catch (error) {}

            try {
              if (
                user.permissions.members.carbonSaved == true ||
                (user.permissions.members.carbonSaved == "commonWorkingGroup" &&
                  commonWorkingGroup) ||
                (user.permissions.members.carbonSaved == "isCoordinator" && isCoordinator)
              ) {
                sanitizedVolunteer.canViewSavedCarbon = true;
              }
            } catch (error) {}

            try {
              if (
                user.permissions.members.transactionHistory == true ||
                (user.permissions.members.transactionHistory == "commonWorkingGroup" &&
                  commonWorkingGroup) ||
                (user.permissions.members.transactionHistory == "isCoordinator" && isCoordinator)
              ) {
                sanitizedVolunteer.transactionHistory = true;
              }
            } catch (error) {}

            try {
              if (
                user.permissions.volunteers.view == true ||
                (user.permissions.volunteers.view == "commonWorkingGroup" &&
                  commonWorkingGroup &&
                  member.volunteer_id) ||
                (user.permissions.volunteers.view == "isCoordinator" && isCoordinator)
              ) {
                sanitizedVolunteer.volunteer_id = volunteer.volunteer_id;
              }
            } catch (error) {}

            try {
              if (
                user.permissions.members.update == true ||
                (user.permissions.members.update == "commonWorkingGroup" && commonWorkingGroup) ||
                (user.permissions.members.update == "isCoordinator" && isCoordinator)
              ) {
                sanitizedVolunteer.canUpdate = true;
              }
            } catch (error) {}

            try {
              if (
                user.permissions.members.canRevokeMembership == true ||
                (user.permissions.members.canRevokeMembership == "commonWorkingGroup" &&
                  commonWorkingGroup) ||
                (user.permissions.members.canRevokeMembership == "isCoordinator" && isCoordinator)
              ) {
                sanitizedVolunteer.canRevokeMembership = true;
              }
            } catch (error) {}

            try {
              if (
                user.permissions.members.delete == true ||
                (user.permissions.members.delete == "commonWorkingGroup" && commonWorkingGroup) ||
                (user.permissions.members.delete == "isCoordinator" && isCoordinator)
              ) {
                sanitizedVolunteer.canDelete = true;
              }
            } catch (error) {}

            try {
              if (
                user.permissions.members.manageMembershipCard == true ||
                (user.permissions.members.manageMembershipCard == "commonWorkingGroup" &&
                  commonWorkingGroup) ||
                (user.permissions.members.manageMembershipCard == "isCoordinator" && isCoordinator)
              ) {
                sanitizedVolunteer.canManageMembershipCard = true;
              }
            } catch (error) {}

            try {
              if (
                user.permissions.volunteers.manageFoodCollectionLink == true ||
                (user.permissions.volunteers.manageFoodCollectionLink == "commonWorkingGroup" &&
                  commonWorkingGroup) ||
                (user.permissions.volunteers.manageFoodCollectionLink == "isCoordinator" &&
                  isCoordinator)
              ) {
                sanitizedVolunteer.canManageFoodCollectionLink = true;
                if (volunteer.fc_key) {
                  sanitizedVolunteer.fc_key = volunteer.fc_key;
                  sanitizedVolunteer.fc_key_active = volunteer.fc_key_active;
                }
              }
            } catch (err) {}

            if (Object.keys(sanitizedVolunteer).length > 0) {
              if (sanitizedVolunteer.roles.length > 0) {
                sanitizedVolunteer.active = true;
              } else {
                sanitizedVolunteer.active = false;
              }

              if (volunteer.membership_type) {
                sanitizedVolunteer.membership_type = volunteer.membership_type;
              }

              sanitizedVolunteer.working_groups = volunteer.working_groups;
              sanitizedVolunteer.member_id = volunteer.member_id;
              sanitizedVolunteer.gdpr = volunteer.gdpr;
              sanitizedVolunteer.is_member = 1;

              if (volunteer.assignedCoordinators.includes(user.id)) {
                sanitizedVolunteer.isAssignedCoordinator = true;
              }

              sanitizedVolunteers.push(sanitizedVolunteer);
            }
          }
        }
      }
    }

    return sanitizedVolunteers;
  };
};
