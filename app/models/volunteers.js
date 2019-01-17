var con = require("./index");
var mysql = require("mysql");
var async = require("async");
var moment = require("moment");
moment.locale("en-gb");
moment.locale("en-gb");

var rootDir = process.env.CWD;

var Helpers = require(rootDir + "/app/configs/helpful_functions");

var Volunteers = {};

Volunteers.getAllRoles = function(callback) {
  var query = "SELECT * FROM volunteer_roles";

  var rolesGroupedByGroup = {};
  var rolesGroupedById = {};

  con.query(query, function(err, roles) {
    async.each(
      roles,
      function(role, callback) {
        role.details = JSON.parse(role.details);

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
  con.query(query, function(err, roles){
    async.each(roles, function(role, callback){
      role.details = JSON.parse(role.details);
      callback()
    }, function(){
      callback(err, roles)
    })
  });
};

Volunteers.sanitizeVolunteer = function(volInfo, callback) {
  async.each(
    volInfo,
    function(volunteer, callback) {
      if(volunteer){
        if (volunteer.lastVolunteered) {
          volunteer.lastVolunteered = moment(volunteer.lastVolunteered).format(
            "l"
          );
          if (volunteer.lastVolunteered < moment().diff(1, "months")) {
            volunteer.needsToVolunteer = "now";
          } else if (volunteer.lastVolunteered < moment().diff(2, "weeks")) {
            volunteer.needsToVolunteer = "soon";
          } else {
            volunteer.needsToVolunteer = false;
          }
        } else {
          volunteer.lastVolunteered = "Never!";
          if (volunteer.createdAt < moment().diff(2, "weeks")) {
            volunteer.needsToVolunteer = "now";
          } else {
            volunteer.needsToVolunteer = "soon";
          }
        }

        if (volunteer.firstVolunteered) {
          volunteer.firstVolunteered = moment(volunteer.firstVolunteered).format(
            "l"
          );
        }

        if (volunteer.roles) {
          volunteer.roles = JSON.parse(volunteer.roles);
        } else {
          volunteer.roles = [];
        }

        if (volunteer.assignedCoordinators) {
          volunteer.assignedCoordinators = JSON.parse(
            volunteer.assignedCoordinators
          );
        } else {
          volunteer.assignedCoordinators = [];
        }

        if(volunteer.survey){
            volunteer.survey = JSON.parse(volunteer.survey);
        } else {
          volunteer.survey = {};
        }

        if(volunteer.availability){
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
        volunteer.lastUpdated = moment(volunteer.lastUpdated).format("L");
        callback();
      } else {
        callback();
      }

    },
    function() {
      callback(volInfo);
    }
  );
};

Volunteers.getVolunteerById = function(member_id, callback) {
  var query = `SELECT volunteer_info.*, MAX(volunteer_hours.date) AS lastVolunteered, MIN(volunteer_hours.date) AS firstVolunteered FROM volunteer_info, volunteer_hours WHERE volunteer_info.member_id = ?`;
  var inserts = [member_id];
  var sql = mysql.format(query, inserts);
  con.query(sql, function(err, volInfo) {
    if (volInfo && !err) {
      Volunteers.sanitizeVolunteer([volInfo[0]], function(volInfoClean) {
        callback(null, volInfoClean[0]);
      });
    } else {
      callback(err, null);
    }
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
      email: volInfo.canShareEmail,
      phone: volInfo.canSharePhone
    })
  ];
  var sql = mysql.format(query, inserts);
  con.query(sql, callback);
};

Volunteers.addRole = function(role, callback) {
  var query =
    "INSERT INTO volunteer_roles (role_id,group_id,details,public) VALUES (?,?,?,0)";
  Helpers.uniqueBase64Id(10, "volunteer_roles", "role_id", function(role_id) {
    var inserts = [role_id];
    inserts.push(role.working_group);
    delete role.working_group;
    inserts.push(JSON.stringify(role));
    var sql = mysql.format(query, inserts);
    con.query(sql, function(err) {
      callback(err, role_id);
    });
  });
};

Volunteers.updateRole = function(role_id, role, callback) {
  var group_id = role.working_group || null;
  delete role.working_group;
  var query =
    "UPDATE volunteer_roles SET group_id = ?, details = ? WHERE role_id = ?";
  var inserts = [group_id, JSON.stringify(role), role_id];

  inserts.push();
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
      callback(err, role);
    } else {
      callback(err, null);
    }
  });
};

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

var contactMethods = [
  "Email",
  "Text",
  "WhatsApp",
  "Facebook Messenger",
  "Phone Call"
];

Volunteers.getRoleSignUpInfo = function(callback) {
  callback(allLocations, allActivities, commitmentLengths);
};

Volunteers.getSignUpInfo = function(callback) {
  Volunteers.getAllRoles(function(
    err,
    roles,
    rolesGroupedByGroup,
    rolesGroupedById
  ) {
    callback(
      allActivities,
      contactMethods,
      roles,
      rolesGroupedByGroup,
      rolesGroupedById
    );
  });
};

module.exports = Volunteers;
