var con = require("./index");
var mysql = require("mysql");
var async = require("async");
var moment = require("moment");
moment.locale("en-gb");

var rootDir = process.env.CWD;

var Settings = require(rootDir + "/app/models/settings");
var VolunteerRoles = require(rootDir + "/app/models/volunteer-roles");

var Helpers = require(rootDir + "/app/configs/helpful_functions");

var Volunteers = {};

Volunteers.getByGroupId = function(group_id, user, callback) {
  var working_groups = user.working_groups_arr;

  var query = `SELECT * FROM volunteer_info volunteers

RIGHT JOIN members ON volunteers.member_id = members.member_id

LEFT JOIN (SELECT member_id hours_member_id, MAX(date) lastVolunteered FROM volunteer_hours GROUP BY member_id) hours ON members.member_id=hours.hours_member_id

LEFT JOIN (SELECT member_id checkins_member_id, checkin_id, MAX(timestamp) lastCheckin  FROM volunteer_checkins GROUP BY member_id, checkin_id) checkins ON members.member_id=checkins.checkins_member_id

ORDER BY lastVolunteered ASC`;

  con.query(query, function(err, returnedVolunteers) {
    Volunteers.sanitizeVolunteer(returnedVolunteers, user, function(
      sanitizedVolunteers
    ) {
      async.eachOf(
        sanitizedVolunteers,
        function(volunteer, i, callback) {
          if (group_id == "inactive") {
            if (volunteer.working_groups.length > 0) {
              sanitizedVolunteers[i] = {};
              callback();
            } else {
              callback();
            }
          } else if (group_id) {
            if (volunteer.working_groups.includes(group_id) == false) {
              sanitizedVolunteers[i] = {};
              callback();
            } else {
              callback();
            }
          } else {
            if (
              !Helpers.hasOneInCommon(
                volunteer.working_groups,
                user.working_groups_arr
              )
            ) {
              sanitizedVolunteers[i] = {};
              callback();
            } else {
              callback();
            }
          }
        },
        function() {
          callback(
            err,
            sanitizedVolunteers.filter(value => Object.keys(value).length !== 0)
          );
        }
      );
    });
  });
};

Volunteers.sanitizeVolunteer = function(volInfo, user, callback) {
  async.each(
    volInfo,
    function(volunteer, callback) {
      if (volunteer) {
        if (volunteer.lastVolunteered) {
          volunteer.nextShiftDue = moment(volunteer.lastVolunteered)
            .add(3, "months")
            .format("l");

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

          volunteer.lastVolunteered = moment(volunteer.lastVolunteered).format(
            "l"
          );
        } else {
          volunteer.nextShiftDue = moment(volunteer.dateCreated)
            .add(1, "months")
            .format("l");

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
        )
          .add(3, "months")
          .format("l");

        if (volunteer.lastCheckin) {
          volunteer.lastCheckin = moment(volunteer.lastCheckin).format("l");
        }

        if (volunteer.firstVolunteered) {
          volunteer.firstVolunteered = moment(
            volunteer.firstVolunteered
          ).format("l");
        } else {
          volunteer.firstVolunteered = null;
        }

        volunteer.lastUpdated = moment(volunteer.lastUpdated).format("L");
        if (volunteer.lastUpdated < moment().diff(-4, "months")) {
          volunteer.needsToUpdate = "now";
        } else if (volunteer.lastUpdated < moment().diff(-6, "months")) {
          volunteer.needsToUpdate = "soon";
        } else {
          volunteer.needsToUpdate = false;
        }

        if (volunteer.roles) {
          volunteer.roles = JSON.parse(volunteer.roles);
        } else {
          volunteer.roles = [];
        }

        if (volunteer.roles.length > 0) {
          volunteer.active = true;
        } else {
          volunteer.active = false;
        }

        if (volunteer.working_groups) {
          volunteer.working_groups = JSON.parse(volunteer.working_groups);
          volunteer.old_working_groups = volunteer.working_groups.slice();
        } else {
          volunteer.working_groups = [];
          volunteer.old_working_groups = [];
        }

        if (volunteer.assignedCoordinators) {
          volunteer.assignedCoordinators = JSON.parse(
            volunteer.assignedCoordinators
          );
        } else {
          volunteer.assignedCoordinators = [];
        }

        if (volunteer.survey) {
          volunteer.survey = JSON.parse(volunteer.survey);
        } else {
          volunteer.survey = {};
        }

        if (volunteer.availability) {
          volunteer.availability = JSON.parse(volunteer.availability);
        } else {
          volunteer.availability = {};
        }

        if (volunteer.gdpr) {
          volunteer.gdpr = JSON.parse(volunteer.gdpr);
        } else {
          volunteer.gdpr = {};
        }
        volunteer.dateCreated = moment(volunteer.dateCreated).format("L");

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

            if (user.class != "admin") {
              //Redact info if common working group
              volunteer.address = null;

              if (
                !Helpers.hasOneInCommon(
                  volunteer.working_groups || [],
                  user.working_groups_arr || []
                )
              ) {
                if (volunteer.survey.gdpr) {
                  if (
                    volunteer.survey.gdpr.email != "on" &&
                    user.class != "staff"
                  ) {
                    volunteer.email = null;
                  }
                  if (
                    volunteer.survey.gdpr.phone != "on" &&
                    user.class != "staff"
                  ) {
                    volunteer.phone_no = null;
                  }
                }
              } else {
                volunteer.canUpdate = true;
              }
            } else {
              volunteer.canUpdate = true;
            }

            callback();
          }
        );
      } else {
        callback();
      }
    },
    function() {
      callback(volInfo);
    }
  );
};

Volunteers.updateRoles = function(member_id, roles, callback) {
  var query = "UPDATE volunteer_info SET roles = ? WHERE member_id = ?";
  var inserts = [JSON.stringify(roles), member_id];
  var sql = mysql.format(query, inserts);
  con.query(sql, callback);
};

Volunteers.getVolunteerById = function(member_id, user, callback) {
  var query = `SELECT * FROM volunteer_info volunteers RIGHT JOIN members ON volunteers.member_id = members.member_id LEFT JOIN (SELECT member_id hours_member_id, MAX(date) lastVolunteered FROM volunteer_hours GROUP BY member_id) hours ON members.member_id=hours.hours_member_id LEFT JOIN (SELECT member_id checkins_member_id, checkin_id, MAX(timestamp) lastCheckin FROM volunteer_checkins GROUP BY member_id, checkin_id) checkins ON members.member_id=checkins.checkins_member_id WHERE volunteers.member_id = ?`;
  var inserts = [member_id];
  var sql = mysql.format(query, inserts);
  con.query(sql, function(err, volInfo) {
    if (volInfo[0] && !err) {
      Volunteers.sanitizeVolunteer([volInfo[0]], user, function(volInfoClean) {
        callback(null, volInfoClean[0]);
      });
    } else {
      callback(err, null);
    }
  });
};

Volunteers.updateActiveStatus = function(member_id, active, callback) {
  var query = `UPDATE volunteer_info SET active = ? WHERE member_id = ?`;
  var inserts = [active, member_id];
  var sql = mysql.format(query, inserts);
  con.query(sql, callback);
};

Volunteers.createInvite = function(action, member_id, user, callback) {
  var query =
    "INSERT INTO access_tokens (token, action, user_id, timestamp, used) VALUES (?,?,?,?,?)";
  Helpers.uniqueBase64Id(25, "access_tokens", "token", function(token) {
    var inserts = [token, action, user.id, new Date(), 0];
    var sql = mysql.format(query, inserts);
    con.query(sql, function(err) {
      var link;
      if (action == "make-volunteer") {
        link =
          process.env.PUBLIC_ADDRESS + "/members/make-volunteer/" + member_id;
      } else if (action == "add-volunteer") {
        link = process.env.PUBLIC_ADDRESS + "/volunteers/add";
      }

      link += "?token=" + token;

      callback(err, link);
    });
  });
};

Volunteers.addExistingMember = function(member_id, volInfo, callback) {
  var query =
    "INSERT INTO volunteer_info (member_id, emergencyContactRelation, emergencyContactName, emergencyContactPhoneNo, roles, assignedCoordinators, survey, availability, gdpr) VALUES (?,?,?,?,?,?,?,?,?)";
  var inserts = [
    member_id,
    volInfo.emergencyContactRelation,
    volInfo.emergencyContactName,
    volInfo.emergencyContactPhoneNo,
    JSON.stringify(volInfo.roles),
    JSON.stringify(volInfo.assignedCoordinators),
    JSON.stringify(volInfo.survey),
    JSON.stringify(volInfo.availability),
    JSON.stringify({
      email: volInfo.gdpr.email,
      phone: volInfo.gdpr.phone
    })
  ];
  var sql = mysql.format(query, inserts);
  con.query(sql, callback);
};

Volunteers.updateVolunteer = function(member_id, volInfo, callback) {
  var query =
    "UPDATE volunteer_info SET emergencyContactRelation = ?, emergencyContactName = ?, emergencyContactPhoneNo = ?, roles = ?, assignedCoordinators = ?, survey = ?, availability = ?, gdpr = ? WHERE member_id = ?";
  var inserts = [
    volInfo.emergencyContactRelation,
    volInfo.emergencyContactName,
    volInfo.emergencyContactPhoneNo,
    JSON.stringify(volInfo.roles),
    JSON.stringify(volInfo.assignedCoordinators),
    JSON.stringify(volInfo.survey),
    JSON.stringify(volInfo.availability),
    JSON.stringify({
      email: volInfo.gdpr.email,
      phone: volInfo.gdpr.phone
    }),
    member_id
  ];
  var sql = mysql.format(query, inserts);
  con.query(sql, callback);
};

Volunteers.getSignUpInfo = function(callback) {
  VolunteerRoles.getAll(function(
    err,
    roles,
    rolesGroupedByGroup,
    rolesGroupedById
  ) {
    Settings.getAll(function(err, settings) {
      callback(
        settings.activities,
        settings.contactMethods,
        roles,
        rolesGroupedByGroup,
        rolesGroupedById,
        settings.volunteerAgreement,
        settings.ourVision,
        settings.saferSpacesPolicy,
        settings.membershipBenefits
      );
    });
  });
};

module.exports = Volunteers;
