var con = require("./index");
var mysql = require("mysql");
var async = require("async");
var moment = require("moment");
moment.locale("en-gb");

var rootDir = process.env.CWD;

var Settings = require(rootDir + "/app/models/settings");

var Helpers = require(rootDir + "/app/configs/helpful_functions");

var VolunteerRoles = {};

VolunteerRoles.getAll = function(callback) {
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

VolunteerRoles.getAllPublic = function(callback) {
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

VolunteerRoles.addRole = function(role, callback) {
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

VolunteerRoles.quickAddRole = function(working_group, title, callback) {
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

VolunteerRoles.updateRole = function(role_id, role, callback) {
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

VolunteerRoles.updateRolePrivacy = function(role_id, public, callback) {
  var query = "UPDATE volunteer_roles SET public = ? WHERE role_id = ?";
  var inserts = [public, role_id];
  var sql = mysql.format(query, inserts);
  con.query(sql, callback);
};

VolunteerRoles.removeRole = function(role_id, callback) {
  var query =
    "UPDATE volunteer_roles SET removed = 1, public = 0 WHERE role_id = ?";
  var inserts = [role_id];
  var sql = mysql.format(query, inserts);
  con.query(sql, callback);
};

VolunteerRoles.activateRole = function(role_id, callback) {
  var query =
    "UPDATE volunteer_roles SET removed = 0, public = 0 WHERE role_id = ?";
  var inserts = [role_id];
  var sql = mysql.format(query, inserts);
  con.query(sql, callback);
};

VolunteerRoles.getRoleById = function(role_id, callback) {
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

VolunteerRoles.getRoleSignUpInfo = function(callback) {
  Settings.getAll(function(err, settings) {
    callback(
      settings.locations,
      settings.activities,
      settings.commitmentLengths
    );
  });
};

module.exports = VolunteerRoles;
