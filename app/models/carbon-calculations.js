var con = require('./index');
var mysql = require('mysql');
var async = require("async");

var Helpers = require("../configs/helpful_functions");
var Members = require("./members");
var Settings = require("./settings");


var carbon = {};

carbon.getByMemberId = function(member_id, callback){
	var query = "SELECT * FROM carbon WHERE member_id = ?";
	var inserts = [member_id]
	var sql = mysql.format(query, inserts);
	
	con.query(sql, callback);
}

carbon.getAll = function(callback){
	var query = "SELECT * FROM carbon";
	con.query(query, callback);	
}

carbon.getAllThisYear = function(callback){
	var query = "SELECT * FROM carbon WHERE YEAR(trans_date) = YEAR(CURDATE());";
	con.query(query, callback);	
}

carbon.getToday = function(callback){
	var query = "SELECT * FROM carbon WHERE DATE(trans_date) = CURDATE()";
	con.query(query, callback);	
}

carbon.add = function(transaction, callback){
	if(transaction.amount > 0){

		var query = "INSERT INTO carbon (transaction_id, member_id, trans_object, trans_date) VALUES (?,?,?,?)";
		
		// Generate ID!
		Helpers.uniqueIntId(20, 'transactions', 'transaction_id', function(id){
			transaction.transaction_id = id;

			var dt = new Date();
			var inserts = [
				transaction.transaction_id, 
				transaction.member_id, 
				transaction.trans_object, 
				new Date(dt.setMonth(dt.getMonth()))
			];
			
			var sql = mysql.format(query, inserts);
			
			con.query(sql, callback);
			
		});
	} else {
		callback(true);
	}
}

module.exports = carbon;