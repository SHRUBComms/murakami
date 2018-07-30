var con = require('./index');
var mysql = require('mysql');
var async = require("async");

var Helpers = require("../configs/helpful_functions");
var Members = require("./members");
var Settings = require("./settings");

var Transactions = {}

Transactions.getAll = function(callback) {
	var query = "SELECT * FROM transactions";
	con.query(query, callback);
}

Transactions.getAllFromLast30Days = function(callback) {
	var query = "SELECT * FROM transactions WHERE transaction_date BETWEEN DATE_SUB(NOW(), INTERVAL 30 DAY) AND NOW() GROUP BY member_id";
	con.query(query, callback);
}

Transactions.getByMemberId = function(member_id, callback) {
	var query = "SELECT * FROM transactions WHERE member_id = ? ORDER BY transaction_date DESC";
	var inserts = [member_id]
	var sql = mysql.format(query, inserts);
	
	con.query(sql, callback);
}

Transactions.add = function(transaction, callback){
	if(transaction.amount > 0){

		Members.getById(transaction.member_id, function(err, member){
			if(err || !member[0]) throw err;

			var query = "INSERT INTO transactions (transaction_id, member_id, transaction_type, categories, amount, comment, transaction_date) VALUES (?,?,?,?,?,?,?)";
			
			// Generate ID!
			Helpers.uniqueIntId(20, 'transactions', 'transaction_id', function(id){
				transaction.transaction_id = id;

				var dt = new Date();
				var inserts = [
					transaction.transaction_id, 
					transaction.member_id, 
					transaction.transaction_type, 
					transaction.categories, 
					transaction.amount, 
					transaction.comment, 
					new Date(dt.setMonth(dt.getMonth()))
				];
				
				console.log(inserts);
				var sql = mysql.format(query, inserts);
				
				con.query(sql, callback);
				
			});		
		});
	} else {
		callback();
	}
}

Transactions.getSwapsToday = function(callback){
	var query = "SELECT * FROM transactions WHERE DATE(transaction_date) = CURDATE() AND categories != 'volunteering' AND categories != 'membership'";
	con.query(query, callback);
}

Transactions.undo = function(transaction_id, callback){
	var query = "SELECT * FROM transactions WHERE transaction_id = ? AND transaction_date < NOW() - INTERVAL 1 MINUTE";
	var inserts = [transaction_id];
	var sql = mysql.format(query, inserts);

	con.query(sql, function(err, result){
		if(result.length == 1){
			// Delete record
			var query = "DELETE * FROM transactions WHERE transaction_id = ?";
			var inserts = [transaction_id];
			var sql = mysql.format(query, inserts);

			con.query(sql, callback);
		} else {
			return callback(Error ('Couldn\'t undo transaction!'));
		}
	});
}


Transactions.makeNice = function(transaction, callback){
	var beautifulTransaction  = {
		date:{
			text: null
		},
		description: {
			text: null
		}
	}

	// Nice membership dates
	var options = {year: 'numeric', month: 'long', day: 'numeric' };
	beautifulTransaction.date.text = new Date(transaction.transaction_date).toLocaleDateString("en-GB",options);

	var options = {hour: '2-digit', minute:'2-digit'};
	beautifulTransaction.date.text += " " + new Date(transaction.transaction_date).toLocaleTimeString('en-GB',options);

	beautifulTransaction.description.text = "<b>" + transaction.amount + " tokens";

	if(transaction.transaction_type == "add") {
		beautifulTransaction.description.text += " added</b>"
	} else if(transaction.transaction_type == "ded"){
		beautifulTransaction.description.text += " deducted</b>"
	}

	var categories = transaction.categories;

	if(categories == "volunteering") {
		beautifulTransaction.description.text += " for volunteering";
		if(transaction.comment){
			beautifulTransaction.description.text += "<br />" +
			"Comment: " + transaction.comment
		}
		callback(beautifulTransaction);
	} else if(categories == "membership") {
		beautifulTransaction.description.text += " for becoming a member"
		callback(beautifulTransaction);
	} else if(categories){
		beautifulTransaction.description.text += " for swapping"
		Settings.getAll(function(err, settings){

			settings[0].definitions = JSON.parse(settings[0].definitions);

			categories = JSON.parse(categories);

			async.eachOf(categories, function(category, key, callback){
				for(i=0;i<settings[0].definitions.items.length;i++){
					if(settings[0].definitions.items[i].id == key) {
						beautifulTransaction.description.text += "<br />" + settings[0].definitions.items[i].name + ": " + categories[key];
					}
				}
				callback();
			}, function (err) {
				if(transaction.comment){
					beautifulTransaction.description.text += "<br />" +
					"Comment: " + transaction.comment
				}

				callback(beautifulTransaction);
			});
			
		});
		

	}
		
}

module.exports = Transactions;