var con = require("./index");
var mysql = require("mysql");
var async = require("async");

var rootDir = process.env.CWD;

var Helpers = require(rootDir + "/app/configs/helpful_functions");

var Volunteers = {};

Volunteers.getAllRoles = function(callback) {
  var query = "SELECT * FROM volunteer_roles";
  con.query(query, function(err, roles){
    async.each(roles, function(role, callback){
      role.details = JSON.parse(role.details);
      callback();
    }, function(){
      callback(err, roles);
    })
  });
}

Volunteers.addRole = function(role, callback){
  var query = "INSERT INTO volunteer_roles (role_id,group_id,details,public) VALUES (?,?,?,0)";
  Helpers.uniqueBase64Id(10, "volunteer_roles", "role_id", function(role_id) {
    var inserts = [role_id];
    inserts.push(role.working_group)
    delete role.working_group;
    inserts.push(JSON.stringify(role));
    var sql = mysql.format(query, inserts);
    con.query(sql, function(err){
      callback(err, role_id)
    })
  });
}

Volunteers.updateRole = function(role_id, role, callback){
  var group_id = role.working_group || null;
  delete role.working_group;
  var query = "UPDATE volunteer_roles SET group_id = ?, details = ? WHERE role_id = ?";
  var inserts = [group_id, JSON.stringify(role), role_id];

  inserts.push();
  var sql = mysql.format(query, inserts);
  con.query(sql, function(err){
    callback(err, role.role_id)
  })
}

Volunteers.updateRolePrivacy = function(role_id, public, callback) {
  var query = "UPDATE volunteer_roles SET public = ? WHERE role_id = ?"
  var inserts = [public, role_id]
  var sql = mysql.format(query, inserts)
  con.query(sql, callback);
}

Volunteers.removeRole = function(role_id, callback) {
  var query = "UPDATE volunteer_roles SET removed = 1, public = 0 WHERE role_id = ?"
  var inserts = [role_id]
  var sql = mysql.format(query, inserts)
  con.query(sql, callback);
}

Volunteers.activateRole = function(role_id, callback) {
  var query = "UPDATE volunteer_roles SET removed = 0, public = 0 WHERE role_id = ?"
  var inserts = [role_id]
  var sql = mysql.format(query, inserts)
  con.query(sql, callback);
}

Volunteers.getRoleById = function(role_id, callback){
  var query = "SELECT * FROM volunteer_roles WHERE role_id = ?"
  var inserts = [role_id]
  var sql = mysql.format(query, inserts)
  con.query(sql, function(err, role){
    if(role[0]){
      role = role[0]
      role.details = JSON.parse(role.details);
      callback(err, role);
    } else {
      callback(err, null)
    }

  })
}

module.exports = Volunteers;
