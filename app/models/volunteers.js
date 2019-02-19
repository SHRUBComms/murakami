var con = require("./index");
var mysql = require("mysql");
var async = require("async");
var moment = require("moment");
moment.locale("en-gb");
moment.locale("en-gb");

var rootDir = process.env.CWD;

var Settings = require(rootDir + "/app/models/settings");

var Helpers = require(rootDir + "/app/configs/helpful_functions");

var Volunteers = {};

Volunteers.getAllRoles = function(callback) {
  var query = "SELECT * FROM volunteer_roles ORDER BY dateCreated DESC";

  var rolesGroupedByGroup = {};
  var rolesGroupedById = {};

  con.query(query, function(err, roles) {
    async.each(
      roles,
      function(role, callback) {
        role.details = JSON.parse(role.details);

        if (Object.keys(role.details).length == 1) {
          role.incomplete = true;
        } else {
          role.incomplete = false;
        }

        if (!role.group_id) role.group_id = "na";
        if (!rolesGroupedByGroup[role.group_id]) {
          rolesGroupedByGroup[role.group_id] = [role];
        } else {
          rolesGroupedByGroup[role.group_id].push(role);
        }

        rolesGroupedById[role.role_id] = role;

        callback();
      },
      function() {
        callback(err, roles, rolesGroupedByGroup, rolesGroupedById);
      }
    );
  });
};

Volunteers.getAllPublicRoles = function(callback) {
  var query = "SELECT * FROM volunteer_roles WHERE public = 1 AND removed = 0";
  con.query(query, function(err, roles) {
    async.each(
      roles,
      function(role, callback) {
        role.details = JSON.parse(role.details);
        callback();
      },
      function() {
        callback(err, roles);
      }
    );
  });
};

Volunteers.sanitizeVolunteer = function(volInfo, user, callback) {
  async.each(
    volInfo,
    function(volunteer, callback) {
      if (volunteer) {
        if (volunteer.lastVolunteered) {
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
          volunteer.lastVolunteered = "Never";
          if (
            moment(volunteer.dateCreated).isBefore(
              moment().subtract(2, "weeks")
            )
          ) {
            volunteer.needsToVolunteer = "now";
            volunteer.lastVolunteeredMessage = "needs to volunteer now";
          } else {
            volunteer.needsToVolunteer = "soon";
            volunteer.lastVolunteeredMessage = "needs to volunteer soon";
          }
        }

        if (volunteer.firstVolunteered) {
          volunteer.firstVolunteered = moment(
            volunteer.firstVolunteered
          ).format("l");
        } else {
          volunteer.firstVolunteered = "Never!";
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

Volunteers.updateVolunteersRoles = function(member_id, roles, callback) {
  var query = "UPDATE volunteer_info SET roles = ? WHERE member_id = ?";
  var inserts = [JSON.stringify(roles), member_id];
  var sql = mysql.format(query, inserts);
  con.query(sql, callback);
};

Volunteers.getVolunteerById = function(member_id, user, callback) {
  var query = `SELECT * FROM volunteer_info volunteers LEFT JOIN (SELECT member_id hours_member_id, MAX(date) lastVolunteered, MIN(date) firstVolunteered FROM volunteer_hours GROUP BY member_id) hours ON volunteers.member_id=hours.hours_member_id WHERE volunteers.member_id = ?`;
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

Volunteers.addRole = function(role, callback) {
  var query =
    "INSERT INTO volunteer_roles (role_id,group_id,details,availability,dateCreated,public) VALUES (?,?,?,?,?,0)";
  Helpers.uniqueBase64Id(10, "volunteer_roles", "role_id", function(role_id) {
    var inserts = [role_id];

    inserts.push(role.working_group);
    delete role.working_group;

    var availability = JSON.stringify(role.availability);
    delete role.availability;

    inserts.push(JSON.stringify(role));
    inserts.push(availability);
    inserts.push(new Date());
    var sql = mysql.format(query, inserts);
    con.query(sql, function(err) {
      callback(err, role_id);
    });
  });
};

Volunteers.quickAddRole = function(working_group, title, callback) {
  var query =
    "INSERT INTO volunteer_roles (role_id,group_id,details,availability,dateCreated,public) VALUES (?,?,?,?,?,0)";
  Helpers.uniqueBase64Id(10, "volunteer_roles", "role_id", function(role_id) {
    var inserts = [
      role_id,
      working_group,
      JSON.stringify({ title: title }),
      JSON.stringify({}),
      new Date()
    ];
    var sql = mysql.format(query, inserts);
    con.query(sql, function(err) {
      callback(err, {
        role_id: role_id,
        group_id: working_group,
        details: { title: title }
      });
    });
  });
};

Volunteers.updateRole = function(role_id, role, callback) {
  var group_id = role.working_group || null;
  delete role.working_group;
  var availability = JSON.stringify(role.availability);
  delete role.availability;
  var query =
    "UPDATE volunteer_roles SET group_id = ?, details = ?, availability = ? WHERE role_id = ?";
  var inserts = [group_id, JSON.stringify(role), availability, role_id];

  var sql = mysql.format(query, inserts);
  con.query(sql, function(err) {
    callback(err, role.role_id);
  });
};

Volunteers.updateRolePrivacy = function(role_id, public, callback) {
  var query = "UPDATE volunteer_roles SET public = ? WHERE role_id = ?";
  var inserts = [public, role_id];
  var sql = mysql.format(query, inserts);
  con.query(sql, callback);
};

Volunteers.removeRole = function(role_id, callback) {
  var query =
    "UPDATE volunteer_roles SET removed = 1, public = 0 WHERE role_id = ?";
  var inserts = [role_id];
  var sql = mysql.format(query, inserts);
  con.query(sql, callback);
};

Volunteers.activateRole = function(role_id, callback) {
  var query =
    "UPDATE volunteer_roles SET removed = 0, public = 0 WHERE role_id = ?";
  var inserts = [role_id];
  var sql = mysql.format(query, inserts);
  con.query(sql, callback);
};

Volunteers.getRoleById = function(role_id, callback) {
  var query = "SELECT * FROM volunteer_roles WHERE role_id = ?";
  var inserts = [role_id];
  var sql = mysql.format(query, inserts);
  con.query(sql, function(err, role) {
    if (role[0]) {
      role = role[0];
      role.details = JSON.parse(role.details);
      if (Object.keys(role.details).length == 1) {
        role.incomplete = true;
      } else {
        role.incomplete = false;
      }

      role.availability = JSON.parse(role.availability) || {};

      role.dateCreated = moment(role.dateCreated).format("l");
      callback(err, role);
    } else {
      callback(err, null);
    }
  });
};

var contactMethods = [
  "Email",
  "Phone call",
  "Text message",
  "WhatsApp",
  "Facebook Messenger"
];
var allLocations = [
  "At home",
  "22 Bread Street",
  "17 Guthrie Street",
  "13 Guthrie Street",
  "Out and about in Edinburgh"
];
var commitmentLengths = [
  "Fixed term",
  "Ongoing",
  "One off",
  "Christmas",
  "Summer"
];
var allActivities = [
  "Administration/office work",
  "Events",
  "Adults",
  "Advice/Information giving",
  "Families",
  "Finance/Accounting",
  "Advocacy/Human Rights",
  "Health and social care",
  "Animals	Heritage",
  "Art and culture: music, drama, crafts, galleries and museums",
  "Homeless and housing",
  "Befriending/Mentoring",
  "Kitchen/Catering",
  "Campaigning/Lobbying",
  "Languages/translating",
  "Care/Support work",
  "LGBT+",
  "Charity shops/Retail",
  "Management/Business",
  "Children",
  "Mental health",
  "Community",
  "Library/Information Management",
  "Computing/Technical",
  "Marketing/PR/Media",
  "Counselling",
  "Politics",
  "Disability",
  "Practical/DIY",
  "Education",
  "Research and policy work",
  "Domestic violence",
  "Sport and recreation",
  "Drugs and addiction",
  "Students'Association",
  "Elderly",
  "Wheelchair accessible",
  "Driving/escorting",
  "Trustee and committee roles",
  "Environment/conservation/outdoors",
  "Tutoring",
  "Equality and Diversity",
  "Youth work"
];

Volunteers.getRoleSignUpInfo = function(callback) {
  Settings.getAll(function(err, settings) {
    callback(
      settings.locations,
      settings.activities,
      settings.commitmentLengths
    );
  });
};

Volunteers.getSignUpInfo = function(callback) {
  Volunteers.getAllRoles(function(
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
