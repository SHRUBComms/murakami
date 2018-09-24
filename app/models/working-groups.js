var con = require('./index');
var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');

var rootDir = process.env.CWD;

var Helpers = require("../configs/helpful_functions");

var Settings = require("./settings");
var Attempts = require("./attempts");


var WorkingGroups = {}

WorkingGroups.verifyGroupById = function(group_id, settings, callback) {

	//console.log(settings.definitions);

	var results = 0;
	for(i=0;i<settings.definitions.working_groups.length;i++){
		if(settings.definitions.working_groups[i].id == group_id.substring(0, 6)){

			if(group_id.length == 6){

				var results = +results + +1
				callback(settings.definitions.working_groups[i]);

			} else if(group_id.length == 10 && settings.definitions.working_groups[i].sub_groups) {

				for(j=0; j<settings.definitions.working_groups[i].sub_groups.length; j++){
					if(settings.definitions.working_groups[i].sub_groups[j].id == group_id.substring(7, 10)){

						var results = results + +1;
						var group = {};
						group.id = group_id;
						group.name = settings.definitions.working_groups[i].name + ": " + settings.definitions.working_groups[i].sub_groups[j].name;
						group.rate = settings.definitions.working_groups[i].rate;

						callback(group);
					}
				}
			}
		}
	}
	if(results == 0){
		callback(null);
	}

}


WorkingGroups.getAllMembersByGroup = function(group_id, callback) {
	var query = "SELECT * FROM members WHERE working_groups LIKE ? ORDER BY first_name ASC";
	var inserts = ["%" + group_id + "%"]
	var sql = mysql.format(query, inserts);
	
	con.query(sql, callback);
}

/* VOLUNTEER HOURS */

WorkingGroups.getAllVolunteerHours = function(callback){
	var query = "SELECT * FROM volunteer_hours";
	
	con.query(query, callback);	
}

WorkingGroups.getHoursThisMonth = function(callback) {
	var query = "SELECT SUM(duration_as_decimal) FROM volunteer_hours WHERE MONTH(date) = MONTH(CURDATE())";
	
	con.query(query, callback);	
}

WorkingGroups.getUnreviewedVolunteerHoursById = function(group_id, callback){
	var query = "SELECT * FROM volunteer_hours WHERE working_group = ? AND approved IS NULL";
	var inserts = [group_id]
	var sql = mysql.format(query, inserts);
	
	con.query(sql, callback);	
}

WorkingGroups.approveHours = function(id, callback){
	var query = "UPDATE volunteer_hours SET approved = 1 WHERE id = ?";
	var inserts = [id]
	var sql = mysql.format(query, inserts);
	
	con.query(sql, callback);
}

WorkingGroups.denyHours = function(id, callback){
	var query = "UPDATE volunteer_hours SET approved = 0 WHERE id = ?";
	var inserts = [id]
	var sql = mysql.format(query, inserts);
	
	con.query(sql, callback);	
}


/* MEMBERSHIP REQUESTS */

WorkingGroups.getNewMembersByGroupId = function(group_id, callback){
	var query = "SELECT * FROM working_group_requests WHERE working_group = ? AND verified = 1 AND MONTH(time_requested) = MONTH(CURDATE())";
	var inserts = [group_id]
	var sql = mysql.format(query, inserts);
	
	con.query(sql, callback);	
}

WorkingGroups.getAllUnreviewedJoinRequests = function(group_id, callback){
	var query = "SELECT * FROM working_group_requests WHERE working_group = ? AND verified IS NULL";
	var inserts = [group_id]
	var sql = mysql.format(query, inserts);

	con.query(sql, callback);	
}

WorkingGroups.getJoinRequestByMemberId = function(member_id, group_id, callback){
	var query = "SELECT * FROM working_group_requests WHERE member_id = ? AND working_group = ? AND verified IS NULL";
	var inserts = [member_id, group_id]
	var sql = mysql.format(query, inserts);
	
	con.query(sql, callback);	
}

WorkingGroups.approveJoinRequest = function(id, callback){
	var query = "UPDATE working_group_requests SET verified = 1 WHERE request_id = ?";
	var inserts = [id]
	var sql = mysql.format(query, inserts);
	
	con.query(sql, callback);
}

WorkingGroups.createJoinRequest = function(member_id, group_id, callback){
	var dt = new Date();
	Helpers.uniqueIntId(11, 'working_group_requests', 'request_id', function(id){
		var query = "INSERT INTO working_group_requests (request_id, member_id, working_group, verified, time_requested) VALUES (?,?,?,?,?)";
		var inserts = [id, member_id, group_id, null, new Date(dt.setMonth(dt.getMonth()))]
		var sql = mysql.format(query, inserts);
		
		con.query(sql, callback);
	});
}

WorkingGroups.deleteJoinRequestById = function(request_id, callback){
	var query = "DELETE FROM working_group_requests WHERE request_id = ?"
	var inserts = [request_id];
	var sql = mysql.format(query, inserts);
	con.query(sql, callback)
}

WorkingGroups.deleteJoinRequestByMemberIdAndGroupId = function(member_id, group_id, callback){
	var query = "DELETE FROM working_group_requests WHERE member_id = ? AND working_group = ?"
	var inserts = [member_id, group_id];
	var sql = mysql.format(query, inserts);
	con.query(sql, callback)
}

WorkingGroups.getJoinRequestById = function(id, callback){
	var query = "SELECT * FROM working_group_requests WHERE request_id = ?";
	var inserts = [id]
	var sql = mysql.format(query, inserts);
	
	con.query(sql, callback);
}

WorkingGroups.denyJoinRequest = function(id, callback){
	var query = "UPDATE working_group_requests SET verified = 0 WHERE request_id = ?";
	var inserts = [id];

	var sql = mysql.format(query, inserts);

	con.query(sql, callback);	
}

/* VOLUNTEER HOURS */

WorkingGroups.getShiftById = function(shift_id, callback){
	var query = "SELECT * FROM volunteer_hours WHERE shift_id = ?";
	var inserts = [shift_id];

	var sql = mysql.format(query, inserts)
	con.query(sql, callback)
}

WorkingGroups.approveShift = function(shift_id, callback){
	var query = "UPDATE volunteer_hours SET approved = 1 WHERE shift_id = ?";
	var inserts = [shift_id];

	var sql = mysql.format(query, inserts)
	con.query(sql, callback)
}

WorkingGroups.denyShift = function(shift_id, callback){
	var query = "UPDATE volunteer_hours SET approved = 0 WHERE shift_id = ?";
	var inserts = [shift_id];

	var sql = mysql.format(query, inserts)
	con.query(sql, callback)
}

WorkingGroups.createShift = function(shift, callback){
	var dt = new Date();
	Helpers.uniqueIntId(11, 'volunteer_hours', 'shift_id', function(id){
		var query = "INSERT INTO volunteer_hours (shift_id, member_id, date, duration_as_decimal, working_group, approved) VALUES (?,?,?,?,?,?)";
		var inserts = [id, shift.member_id, new Date(dt.setMonth(dt.getMonth())), shift.duration, shift.working_group, shift.approved]
		var sql = mysql.format(query, inserts);
		
		con.query(sql, callback);
	});
}

WorkingGroups.getAllApprovedVolunteerHoursByGroupId = function(group_id, callback) {

	var query = "SELECT * FROM volunteer_hours WHERE working_group = ? AND approved = 1";
	var inserts = [group_id]
	var sql = mysql.format(query, inserts);
	
	con.query(sql, callback);	

}



/* MAKE NICE FUNCTIONS */


WorkingGroups.makeJoinRequestNice = function(request, callback){

	var Members = require("./members");

	Members.getById(request.member_id, function(err, member){
		if(member[0] && !err){
			var beautifulRequest = {};
			beautifulRequest.name = member[0].first_name + " " + member[0].last_name;
			beautifulRequest.id = request.request_id;
			beautifulRequest.member_id = request.member_id;

			var options = {year: 'numeric', month: 'long', day: 'numeric' };
			beautifulRequest.date = new Date(request.time_requested).toLocaleDateString("en-GB",options);

			callback(beautifulRequest);
		} else {
			callback({})
		}
	});
}


WorkingGroups.makeVolunteerHoursNice = function(hours, settings, callback){

	var Members = require("./members");

	Members.getById(hours.member_id, function(err, member){
		if(err){
			console.log(err);
			callback(null)
		} else {
			var beautifulHours = {};
			beautifulHours.name = member[0].first_name + " " + member[0].last_name;
			beautifulHours.id = hours.id;
			beautifulHours.member_id = hours.member_id;

			WorkingGroups.verifyGroupById(hours.working_group, settings, function(group){
				beautifulHours.working_group = group.name;

				beautifulHours.duration = hours.duration_as_decimal;
				beautifulHours.tokens = Math.floor(hours.duration_as_decimal * group.rate)

				var options = {year: 'numeric', month: 'long', day: 'numeric' };
				beautifulHours.date = new Date(hours.date).toLocaleDateString("en-GB",options);

				callback(beautifulHours);
			});
		}
	});
}

module.exports = WorkingGroups;
