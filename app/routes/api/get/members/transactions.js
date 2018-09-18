// /api/get/members/transactions

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var Members = require(rootDir + "/app/models/members");
var Settings = require(rootDir + "/app/models/settings");
var Transactions = require(rootDir + "/app/models/transactions");

var Auth = require(rootDir + "/app/configs/auth");

router.get('/:member_id', Auth.isLoggedIn, function (req, res) {

	Members.getById(req.params.member_id, function(err, member){
		if(err || !member[0]){
			req.flash('error_msg', 'Member not found!');
			res.redirect('/members');
		} else {

			Settings.getAll(function(err, settings){
				settings = settings[0];
				settings.definitions = JSON.parse(settings.definitions);
				Transactions.getByMemberId(req.params.member_id, function(err, transactions){
					if(err) throw err;

					async.eachOf(transactions, function(transaction, i, callback){
						Transactions.makeNice(transactions[i], settings, function(transaction){
							transactions[i] = transaction;
							callback();
						});
					}, function (err) {
						res.send(transactions);
					});
											
				});				
			})

		}	
	});
});

module.exports = router;