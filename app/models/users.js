var con = require('./index');
var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var async = require('async');

var Helpers = require("../configs/helpful_functions");
var Settings = require("./settings");
var Attempts = require("./attempts");
var WorkingGroups = require("./working-groups");

var Users = {}

Users.getAll = function(callback) {
	var query = "SELECT * FROM login WHERE deactivated = 0 ORDER BY CONCAT(first_name, last_name) ASC ";
	con.query(query, callback);
}

Users.getByUsername = function(username, callback) {
	var query = "SELECT * FROM login WHERE username = ?";
	var inserts = [username]
	var sql = mysql.format(query, inserts);
	
	con.query(sql, callback);
}

Users.getByUsernameOrEmail = function(email, callback) {
	var query = "SELECT * FROM login WHERE (username = ? OR email = ?) AND deactivated = 0";
	var inserts = [email, email]
	var sql = mysql.format(query, inserts);
	
	con.query(sql, callback)
}

Users.getByEmail = function(email, callback) {
	var query = "SELECT * FROM login WHERE email = ?";
	var inserts = [email]
	var sql = mysql.format(query, inserts);
	
	con.query(sql, callback)
}

Users.getById = function(id, callback) {
	var query = "SELECT * FROM login WHERE id = ?";
	var inserts = [id]
	var sql = mysql.format(query, inserts);
	
	con.query(sql, callback);
}

Users.addPasswordReset = function(user_id, ip_address, callback){
	var query = "INSERT INTO password_reset (user_id, ip_address, reset_code, date_issued, used) VALUES (?,?,?,?,?)";
	Helpers.uniqueBase64Id(25, 'password_reset', 'reset_code', function(id){
		var dt = new Date();
		var inserts = [user_id, ip_address, id, new Date(dt.setMonth(dt.getMonth())), 0];
		var sql = mysql.format(query, inserts);
		
		con.query(sql);
		Users.getById(user_id, callback);
	});
}

Users.getUnusedPasswordResetsByUserId = function(user_id, callback){
	var query = "SELECT * FROM password_reset WHERE user_id = ? AND used = 0 AND date_issued > (now() - interval 60 minute)";
	var inserts = [user_id];
	var sql = mysql.format(query, inserts);
	
	con.query(sql, callback);
}

Users.getUnusedPasswordResetsByResetCode = function(reset_code, callback){
	var query = "SELECT * FROM password_reset WHERE reset_code = ? AND used = 0 AND date_issued > (now() - interval 60 minute)";
	var inserts = [reset_code];
	var sql = mysql.format(query, inserts);
	
	con.query(sql, callback);
}

Users.updateWorkingGroups = function(user_id, admin_wg, callback){
	var query = "UPDATE login SET admin_wg = ? WHERE id = ?"
	var inserts = [admin_wg, user_id];
	var sql = mysql.format(query, inserts)

	con.query(sql, callback)
}

Users.add = function(user, callback){
	var query = "INSERT INTO login (id, first_name, last_name, username, email, password, admin, admin_wg) VALUES (?,?,?,?,?,?,?,?)";

	// Generate ID!
	Helpers.uniqueIntId(11, 'login', 'id', function(id){
		user.id = id;
		bcrypt.genSalt(10, function(err, salt) {
		    bcrypt.hash(user.password, salt, null, function(err, hash) {
		        user.password = hash.replace(/^\$2y(.+)$/i, '$2a$1');
				var inserts = [user.id, user.first_name, user.last_name, user.username, user.email, user.password, user.admin, user.admin_wg];
				var sql = mysql.format(query, inserts);
				
				con.query(sql);
				Users.getById(user.id, callback);
		    });
		});
	});

}

Users.update = function(user, callback){

	var query = "UPDATE login SET first_name = ?, last_name = ?, admin = ?, admin_wg = ? WHERE id = ?";
	var inserts = [user.first_name, user.last_name, user.admin, user.admin_wg, user.user_id];
	var sql = mysql.format(query, inserts);


	con.query(sql, callback);
}

Users.updatePassword = function(user_id, password, callback){

	var query = "UPDATE login SET password = ? WHERE id = ?";
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(password, salt, null, function(err, hash) {
	        password = hash.replace(/^\$2y(.+)$/i, '$2a$1');
			var inserts = [password, user_id];
			var sql = mysql.format(query, inserts);

			con.query(sql, callback);
	    });
	});

}

Users.deactivate = function(user_id, callback){
	var query = "UPDATE login SET deactivated = 1 WHERE id = ?";
	var inserts = [user_id];
	var sql = mysql.format(query, inserts)

	con.query(sql, callback);
}

Users.setResetCodeAsUsed = function(reset_code, callback){
	var query = "UPDATE password_reset SET used = 1 WHERE reset_code = ?";
	var inserts = [reset_code];
	var sql = mysql.format(query, inserts);

	con.query(sql, callback);
}

Users.comparePassword = function(candidatePassword, hash, callback){
	hash = hash.replace(/^\$2y(.+)$/i, '$2a$1');
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	if(err) throw err;
    	callback(null, isMatch);
	});
}

Users.makeNice = function(user, settings, callback) {
	var beautifulUser  = {
		id: null,
		username: null,
		first_name: null,
		last_name: null,
		full_name: null,
		admin: null,
		working_groups: {},
		last_login: null

	}

	// User id
	beautifulUser.id = user.id

	// Username
	beautifulUser.username = user.username;

	// First name
	beautifulUser.first_name = user.first_name;

	// Last name
	beautifulUser.last_name = user.last_name;

	// Full name
	beautifulUser.full_name = user.first_name + " " + user.last_name;

	// Email
	beautifulUser.email = user.email;

	// Admin status
	if(user.admin == 1){
		beautifulUser.admin = true;
	}

	// Working groups
	if(user.admin_wg){
		Settings.getAll(function(err, settings){
			settings = settings[0]
			settings.definitions = JSON.parse(settings.definitions);
			user.working_groups = JSON.parse(user.admin_wg);

			async.eachOf(user.working_groups, function(working_group, i, callback){
				WorkingGroups.verifyGroupById(user.working_groups[i], settings, function(group){
					if(group){
						beautifulUser.working_groups[group.id] = group.name
					}
				});
				callback();
			}, function(err){
				Attempts.getLastLogin(user.id, function(err, logins){
					if(logins[0]) {
						beautifulUser.last_login = new Date(logins[0].login_timestamp).toLocaleDateString("en-GB");
					}

					callback(beautifulUser);
				});				
			})
		});
	} else {

		Attempts.getLastLogin(user.id, function(err, logins){
			if(logins[0]) {
				beautifulUser.last_login = new Date(logins[0].login_timestamp).toLocaleDateString("en-GB");
			}

			callback(beautifulUser);
		});
	}
	
}

module.exports = Users;
