// Import resources
var express = require('express');
var router = express.Router();
var app = express();
var async = require("async");
var md5 = require('md5');
var request = require('request');

// Import models
var Members = require("../models/members");
var WorkingGroups = require("../models/working-groups");
var Transactions = require("../models/transactions");
var Auth = require("../configs/auth");
var Helpers = require("../configs/helpful_functions");
var Settings = require("../models/settings");
var Mailchimp = require('mailchimp-api-v3');
var Carbon = require("../models/carbon-calculations");
var AccessTokens = require("../models/access-tokens");
var Mail = require("../configs/mail");

function censorName(name){
    var name = name.split(' ');
    nameCensored = name[0] + " ";
    name.splice(0, 1);
    for(i=0; i<name.length;i++){
      middleLength = name[i].length - 2
      nameCensored += name[i].slice(0,1) + "*".repeat(middleLength) + name[i].slice(-1)
      if(i+1 != name.length){
      	nameCensored += " ";
      }
    }
    return nameCensored;
}

function censorEmail(email){
    var email = email.split('@');
    usernameMiddleLength = email[0].length - 2;
    domainMiddleLength = email[1].length -2;
    return email[0].slice(0,1) + "*".repeat(usernameMiddleLength) + email[0].slice(-1) + "@" + email[1].slice(0, 1) + "*".repeat(domainMiddleLength) + email[1].slice(-1);	
}

router.get('/', Auth.isLoggedIn, function (req, res) {
	Members.getAll(function(err, members){
		Settings.getAll(function(err, settings){
			settings = settings[0];
			settings.definitions = JSON.parse(settings.definitions);
			async.eachOf(members, function(member, i, callback){
				Members.makeNice(members[i], settings, function(member){
					members[i] = member;
					callback();
				});
			}, function (err) {
				res.render('members/all', {
				  	title: "Members",
				  	members: members,
				  	membersActive: true	
				});
			});			
		})

	});
});



router.get('/view/:member_id', Auth.isLoggedIn, function (req, res) {

	Members.getById(req.params.member_id, function(err, member){
		if(err || !member[0]){
			req.flash('error_msg', 'Member not found!');
			res.redirect('/members');
		} else {
			Settings.getAll(function(err, settings){			
				settings = settings[0];
				settings.definitions = JSON.parse(settings.definitions);
				Members.makeNice(member[0], settings, function(member){

					res.render('members/view', {
					  	title: "View Member",
					  	member: member,
					  	settings: settings,
					  	membersActive: true
					});
				});
			});		
		}	
	});
});

router.post('/search', function(req, res){
	var term = req.body.term;
	if(!term) {
		res.send({status: "ok", results: []});
	} else {
		Members.searchByName(term, function(err, members){
			Settings.getAll(function(err, settings){
				settings = settings[0];
				settings.definitions = JSON.parse(settings.definitions)
				if(err){
					res.send({status: "fail", results: []});
				} else {
					async.eachOf(members, function(member, i, callback){
						Members.makeSearchNice(members[i], settings, function(member){
							members[i] = {};
							members[i].id = member.id
							if(req.user){
								if(req.user.admin){
									members[i].name = member.name;
									members[i].email = member.email;
									members[i].working_groups = member.working_groups;
								} else if (req.user) {
									members[i].name = member.name;
									members[i].email = censorEmail(member.email)
									members[i].working_groups = member.working_groups;
								}
							} else {
								members[i].name = censorName(member.name);
								members[i].email = censorEmail(member.email)
								members[i].working_groups = member.working_groups;
							}

							callback();
						});
					}, function (err) {

						res.send({status: "ok", results: members});
					});
					
				}
			})
		});
	}
});

router.get('/carbon-saved/:member_id', Auth.isLoggedIn, function(req, res){
	Carbon.getByMemberId(req.params.member_id, function(err, carbon){
		if(err || carbon.length == 0){
			res.send({carbon: 0});
		} else {
			totalCarbon = 0;
			Settings.getAll(function(err, settings){
				settings = settings[0];
				settings.definitions = JSON.parse(settings.definitions);
				for(i=0;i<carbon.length;i++){
					carbon[i].trans_object = JSON.parse(carbon[i].trans_object);

					Object.keys(carbon[i].trans_object).forEach(function(key) {
					    for(j=0;j<settings.definitions.items.length;j++){
					    	if(key == settings.definitions.items[j].id){
					    		totalCarbon += (carbon[i].trans_object[key] * settings.definitions.items[j].factor) * 1e-3;
					    	}
					    }
					});
				}
				res.send({carbon: totalCarbon.toFixed(2)});
			});
		}
	});
});

router.get('/balance/:member_id', Auth.isLoggedIn, function(req, res){
	Members.getById(req.params.member_id, function(err, member){
		if(err || !member[0]){
			res.send({balance:0});
		} else {
			res.send({balance:member[0].balance})
		}
	})
});


router.get('/transactions/:member_id', Auth.isLoggedIn, function (req, res) {

	Members.getById(req.params.member_id, function(err, member){
		if(err || !member[0]){
			req.flash('error_msg', 'Member not found!');
			res.redirect('/members');
		} else {

			Transactions.getByMemberId(req.params.member_id, function(err, transactions){
				if(err) throw err;

				async.eachOf(transactions, function(transaction, i, callback){
					Transactions.makeNice(transactions[i], function(transaction){
						transactions[i] = transaction;
						callback();
					});
				}, function (err) {
					res.send(transactions);
				});
										
			});
		}	
	});
});

router.post('/transactions/:member_id/:type', Auth.isLoggedIn, function(req, res) {

	var message = {
		status: "fail",
		msg: null
	};

	var useTokens = req.body.useTokens

	if(useTokens == "true") {
		useTokens = true;
	} else if(useTokens == "false") {
		useTokens = false;
	}


	Members.getById(req.params.member_id, function(err, member){

		if(!err && member[0]){
			if(req.params.type == "add" || req.params.type == "ded") {

				if(useTokens){

					//console.log("Using tokens");

					var transaction = req.body.transaction;

					var formattedTransaction = {}
					formattedTransaction.member_id = req.params.member_id;
					formattedTransaction.transaction_type = req.params.type;
					formattedTransaction.categories = {};
					formattedTransaction.amount = 0;
					formattedTransaction.comment = null;

				    var formattedWeights = {}
				    formattedWeights.member_id = req.params.member_id;
				    formattedWeights.trans_object = {};
				    formattedWeights.amount = 0;

					for(i=0; i<transaction.length; i++){

						if(!isNaN(parseFloat(transaction[i].tokens)) && transaction[i].tokens > 0){

							if(formattedTransaction.categories[transaction[i].id] == null){
								formattedTransaction.categories[transaction[i].id] = transaction[i].tokens;
							} else {
								formattedTransaction.categories[transaction[i].id] = +transaction[i].tokens + +formattedTransaction.categories[transaction[i].id];
							}
							
						}

					    if(!isNaN(parseFloat(transaction[i].weight)) && transaction[i].weight > 0){

					      if(formattedWeights.trans_object[transaction[i].id] == null){
					        formattedWeights.trans_object[transaction[i].id] = transaction[i].weight;
					      } else {
					        formattedWeights.trans_object[transaction[i].id] = +transaction[i].weight + +formattedWeights.trans_object[transaction[i].id];
					      }
					      
					    }

					}

					Object.keys(formattedTransaction.categories).forEach(function(key) {				  	
						formattedTransaction.amount += +formattedTransaction.categories[key];
					});

					Object.keys(formattedWeights.trans_object).forEach(function(key) {            
					    formattedWeights.amount += +formattedWeights.trans_object[key];
					});


					if(formattedTransaction.amount > 0 ){
						if(req.params.type == "ded"){
							var balance = member[0].balance - formattedTransaction.amount;
						} else if(req.params.type == "add"){
							var balance = +member[0].balance + +formattedTransaction.amount;
						}

						if(balance >= 0){
							if((formattedWeights.amount <= 0 && req.params.type == "add") || (formattedWeights.amount > 0 && req.params.type == "ded")){
								formattedTransaction.categories = JSON.stringify(formattedTransaction.categories);
								Transactions.add(formattedTransaction, function(err){
									if(err) {
										message.status = "fail";
										message.msg = "Something went wrong!";
										res.send(message);
									} else {

										Members.updateBalance(req.params.member_id, balance, function(err){
											if(err){
												message.status = "fail";
												message.msg = "Something went wrong!";
												res.send(message);									
											} else {
												Members.updateActiveSwapperStatus(req.params.member_id, 1, function(err){
													if(req.params.type == "ded"){
													    formattedWeights.trans_object = JSON.stringify(formattedWeights.trans_object);
													    Carbon.add(formattedWeights, function(err){
													      if(err) {
													        message.status = "fail";
													        message.msg = "Something went wrong!";
													        res.send(message);
													      } else {
															totalCarbon = 0;
															Settings.getAll(function(err, settings){
																settings = settings[0];
																settings.definitions = JSON.parse(settings.definitions);
																formattedWeights.trans_object = JSON.parse(formattedWeights.trans_object)

																Object.keys(formattedWeights.trans_object).forEach(function(key) {
																    for(j=0;j<settings.definitions.items.length;j++){
																    	if(key == settings.definitions.items[j].id){
																    		totalCarbon += (formattedWeights.trans_object[key] * settings.definitions.items[j].factor) * 1e-3;
																    	}
																    }
																});

														        message.status = "ok";
														        message.msg = "Transaction complete! " + totalCarbon.toFixed(2) + "kg of carbon saved";
														        res.send(message);														
															});

													      }
													    });
													} else {
												        message.status = "ok";
												        message.msg = "Transaction complete!";
												        res.send(message);												
													}
												});
											}
										});

									}
								});
							} else {
								message.status = "fail";
								message.msg = "Please enter a total weight greater than 0";
								res.send(message);								
							}
						} else {
							message.status = "fail";
							message.msg = member[0].first_name + " doesn't have enough tokens!";
							res.send(message);
						}

					} else {
						message.status = "fail";
						message.msg = "Please enter a total amount of tokens greater than 0";
						res.send(message);
					}
				} else if(req.params.type == "ded" && !useTokens) { 

					var transaction = req.body.transaction;

				    var formattedWeights = {}
				    formattedWeights.member_id = req.params.member_id;
				    formattedWeights.trans_object = {};
				    formattedWeights.amount = 0;

					for(i=0; i<transaction.length; i++){

					    if(!isNaN(parseFloat(transaction[i].weight)) && transaction[i].weight > 0){

					      if(formattedWeights.trans_object[transaction[i].id] == null){
					        formattedWeights.trans_object[transaction[i].id] = transaction[i].weight;
					      } else {
					        formattedWeights.trans_object[transaction[i].id] = +transaction[i].weight + +formattedWeights.trans_object[transaction[i].id];
					      }
					      
					    }

					}


					Object.keys(formattedWeights.trans_object).forEach(function(key) {            
					    formattedWeights.amount += +formattedWeights.trans_object[key];
					});

					if(formattedWeights.amount > 0){
					    formattedWeights.trans_object = JSON.stringify(formattedWeights.trans_object);
					    Carbon.add(formattedWeights, function(err){
					      if(err) {
					        message.status = "fail";
					        message.msg = "Something went wrong!";
					        res.send(message);
					      } else {
							totalCarbon = 0;
							Settings.getAll(function(err, settings){
								settings = settings[0];
								settings.definitions = JSON.parse(settings.definitions);
								formattedWeights.trans_object = JSON.parse(formattedWeights.trans_object)

								Object.keys(formattedWeights.trans_object).forEach(function(key) {
								    for(j=0;j<settings.definitions.items.length;j++){
								    	if(key == settings.definitions.items[j].id){
								    		totalCarbon += (formattedWeights.trans_object[key] * settings.definitions.items[j].factor) * 1e-3;
								    	}
								    }
								});

						        message.status = "ok";
						        message.msg = "Transaction complete! " + totalCarbon.toFixed(2) + "kg of carbon saved";
						        res.send(message);														
							});

					      }
					    });
					} else {
						message.status = "fail";
						message.msg = "Please enter a total weight greater than 0g";
						res.send(message);					
					}

				} else if(req.params.type != "ded" && !useTokens) {
					message.status = "fail";
					message.msg = "No need to log incoming weights!";
					res.send(message);
				} else {
					message.status = "fail";
					message.msg = "Something went wrong!";
					res.send(message);					
				}					
			} else {
				message.status = "fail";
				message.msg = "Invalid type!";
				res.send(message);
			}
		} else {
			message.status = "fail";
			message.msg = "Member not found!";
			res.send(message);
		}
	});

});

router.get('/update/:member_id', Auth.isLoggedIn, Auth.isAdmin, function (req, res) {

	Members.getById(req.params.member_id, function(err, member){
		if(err || !member[0]){
			req.flash('error_msg', 'Member not found!');
			res.back();
		} else {

			res.render('members/update', {
			  	title: "Update Member",
			  	membersActive: true,

				member_id: req.params.member_id,
				first_name: member[0].first_name,
				last_name: member[0].last_name,
				email: member[0].email,
				phone_no: member[0].phone_no,
				address: member[0].address
			});	
		}	
	});

})

router.post('/update/:member_id', Auth.isLoggedIn, Auth.isAdmin, function (req, res) {
	Members.getById(req.params.member_id, function(err, member){
		if(err || !member[0]) {
			req.flash('error_msg', 'Something went wrong, please try again!');
			res.redirect('/members/update/' + req.params.member_id);
		} else {
			var first_name = req.body.first_name.trim();
			var last_name = req.body.last_name.trim();
			var email = req.body.email.trim();
			var phone_no = req.body.phone_no.trim();
			var address = req.body.address.trim();

			// Validation
			req.checkBody("first_name", "Please enter a first name").notEmpty();
			req.checkBody("first_name", "Please enter a shorter first name (<= 20 characters)").isLength({max: 20});

			req.checkBody("last_name", "Please enter a last name").notEmpty();
			req.checkBody("last_name", "Please enter a shorter last name (<= 30 characters)").isLength({max: 30});

			req.checkBody("email", "Please enter an email address").notEmpty();
			req.checkBody("email", "Please enter a shorter email address (<= 89 characters)").isLength({max: 89});
			req.checkBody("email", "Please enter a valid email address").isEmail();

			if(phone_no){
				req.checkBody("phone_no", "Please enter a shorter phone number (<= 15)").isLength({max: 15});
				req.checkBody("phone_no", "Please enter a valid UK phone number").isMobilePhone("en-GB");
			}

			var member = {
				member_id: req.params.member_id,
				first_name: first_name,
				last_name: last_name,
				email: email,
				phone_no: phone_no,
				address: address				
			};

			// Parse request's body
			var errors = req.validationErrors();
		    if(errors) {

				res.render('members/update',{
				  	title: "Update Member",
				  	membersActive: true,
					errors: errors,
					member_id: req.params.member_id,
					first_name: first_name,
					last_name: last_name,
					email: email,
					phone_no: phone_no,
					address: address
				});

		    } else {
				Members.updateBasic(member, function(err, member){
					if(err) throw err;

					req.flash('success_msg', first_name + ' updated!');
					res.redirect('/members/view/' + req.params.member_id);
				});
		    }
		}
	});
});


router.get('/add', function(req, res) {
	AccessTokens.get(req.query.token, "add_member", function(tokenValid){
		if(req.user || tokenValid){
			Settings.getAll(function(err, settings){
				settings = settings[0];
				settings.definitions = JSON.parse(settings.definitions);

				res.render('members/add', {
				  	title: "Add Member",
				  	membersActive: true,
				  	settings: settings,
				  	token: req.query.token,
				  	working_groups: {}
				});
			});
		} else {
			res.redirect("/");
		}
	})
});

router.post('/add', function (req, res) {
	AccessTokens.get(req.query.token, "add_member", function(tokenValid){
		if(req.user || tokenValid == true){

			Settings.getAll(function(err, settings){
				settings = settings[0]
				settings.definitions = JSON.parse(settings.definitions);

				var first_name = req.body.first_name.trim();
				var last_name = req.body.last_name.trim();
				var email = req.body.email.trim();
				var phone_no = req.body.phone_no.trim();
				var address = req.body.address.trim();
				var membership_type = req.body.membership_type.trim();
				var volunteer_status = req.body.volunteer_status.trim();
				var membership_length = req.body.membership_length.trim();


				var shrubExplained = req.body.shrubExplained;
				var safeSpace = req.body.safeSpace;
				var contactConsent = req.body.contactConsent;
				var gdprConsent = req.body.gdprConsent;


				var fseNewsletterConsent = req.body.fseNewsletterConsent;
				var generalNewsletterConsent = req.body.generalNewsletterConsent;

				if(req.body.working_groups){
					var working_groups = JSON.parse(req.body.working_groups);
				}
				
				// Validation
				req.checkBody("first_name", "Please enter a date of birth").notEmpty();

				req.checkBody("first_name", "Please enter a first name").notEmpty();
				req.checkBody("first_name", "Please enter a shorter first name (<= 20 characters)").isLength({max: 20});

				req.checkBody("last_name", "Please enter a last name").notEmpty();
				req.checkBody("last_name", "Please enter a shorter last name (<= 30 characters)").isLength({max: 30});

				req.checkBody("email", "Please enter an email address").notEmpty();
				req.checkBody("email", "Please enter a shorter email address (<= 89 characters)").isLength({max: 89});
				req.checkBody("email", "Please enter a valid email address").isEmail();

				req.checkBody("shrubExplained", "Please make sure you have explained SHRUB's vision").notEmpty();
				req.checkBody("safeSpace", "Please make sure you have explained our Safe Space policy").notEmpty();
				req.checkBody("contactConsent", "Please make sure this member has consented to being contacted by email").notEmpty();
				req.checkBody("gdprConsent", "Please make sure this member has agreed to our privacy policy").notEmpty();

				if(phone_no){
					req.checkBody("phone_no", "Please enter a shorter phone number (<= 15)").isLength({max: 15});
					req.checkBody("phone_no", "Please enter a valid UK mobile phone number").isMobilePhone("en-GB");
				}

				var dob = new Date(req.body.dob);
				var today = new Date();

				var over16 = (today - dob) / (1000 * 3600 * 24 * 365) >= 16;

				if(!over16) {
					console.log("Too young!");
				}

				

				// Parse membership info
				if(membership_length == "year"){
					var dt = new Date();
					current_exp_membership = new Date(dt.setMonth(dt.getMonth() + 12));
				} else {
					var dt = new Date();
					current_exp_membership = new Date(dt.setMonth(dt.getMonth() + 6));
				}

				if(volunteer_status == "regularly"){
					volunteer_status = 0;
				} else if(volunteer_status == "occasionally") {
					volunteer_status = 1;
				} else {
					volunteer_status = 2;
				}

				if(membership_type == "paid") {
					free = 0;
				} else if(membership_type == "free") {
					free = 1;
					volunteer_status = 0;
					var dt = new Date();
					current_exp_membership = new Date(dt.setMonth(dt.getMonth() + 2));
				}
				var dt = new Date();
				var earliest_membership_date = new Date(dt.setMonth(dt.getMonth()));
				var current_init_membership = new Date(dt.setMonth(dt.getMonth()));

				if(working_groups){

					if(Object.keys(working_groups).length !== 0) {
						var formattedWorkingGroups = {}
						Object.keys(working_groups).forEach(function(key) {
							WorkingGroups.verifyGroupById(key, settings, function(group){
								if(group){
									formattedWorkingGroups[key] = group.id; 
								}
							})
						});
					}
				}

				// Parse request's body
				var errors = req.validationErrors();

	            

	            if (!errors && !over16) {
	            	var error = {param: "dob", msg: "Must be over 16 to be a member", value: req.body.dob};
	                errors = [];
	                errors.push(error);
	            }
	            

			    if(errors) {

					res.render('members/add',{
						errors: errors,
						membersActive: true,
						title: "Add Member",
						first_name: first_name,
						last_name: last_name,
						email: email,
						phone_no: phone_no,
						address: address,
						token: req.query.token,
						settings: settings,
						working_groups: working_groups,
						shrubExplained: shrubExplained,
						safeSpace: safeSpace,
						contactConsent: contactConsent,
						gdprConsent: gdprConsent,
						dob: dob

					});


			    } else {

					var newMember = {
						member_id: null,
						first_name: first_name,
						last_name: last_name,
						email: email,
						phone_no: phone_no,
						address: address,
						free: free,
						volunteer_status: volunteer_status,
						earliest_membership_date: earliest_membership_date,
						current_init_membership: current_init_membership,
						current_exp_membership: current_exp_membership
					};

					Members.add(newMember, function(err, member){
						if(err) throw err;
						member = member[0];


						var formattedWorkingGroups = []


						Object.keys(working_groups).forEach(function(key) {
							WorkingGroups.verifyGroupById(key, settings, function(group){
								if(group){
									formattedWorkingGroups.push(key); 
								}
							})
						});


				    	if(req.user.admin){

				    		Members.updateWorkingGroups(member.member_id, JSON.stringify(formattedWorkingGroups), function(){});

				    		
				    	} else {
				    		for(i=0; i<formattedWorkingGroups.length; i++) {
			                    WorkingGroups.createJoinRequest(member.member_id, formattedWorkingGroups[i], function(){});
				    		}
				    	}					


						var shrubMailchimp = new Mailchimp(process.env.SHRUB_MAILCHIMP_SECRET_API_KEY);
						var fseMailchimp = new Mailchimp(process.env.FSE_MAILCHIMP_SECRET_API_KEY);

				        var subscribeBody = {
				            email_address: email,
				            status: "subscribed",
				            merge_fields: {
				                FNAME: first_name,
				                LNAME: last_name
				            }
				        }
				        if(generalNewsletterConsent == "on"){
					        shrubMailchimp.put('/lists/' + process.env.SHRUB_MAILCHIMP_NEWSLETTER_LIST_ID + '/members/' + md5(email), subscribeBody);
					    }

				        if(fseNewsletterConsent == "on"){
					        fseMailchimp.put('/lists/' + process.env.FSE_MAILCHIMP_NEWSLETTER_LIST_ID + '/members/' + md5(email), subscribeBody);
					    }

					    if(membership_length == "year"){
					    	var transaction = {
								member_id: member.member_id, 
								transaction_type: 'add', 
								categories: 'membership', 
								amount: 5, 
								comment: null
					    	};
					    	Transactions.add(transaction, function(err){
				    			Members.updateBalance(member.member_id, 5, function(err){});
					    	});
					    }

						req.flash('success_msg', 'New member added!');
						if(req.query.token){
							// TODO: mark token as used
							AccessTokens.markAsUsed(req.query.token, function(err){
								res.redirect('/success');
							});
						} else {
							res.redirect('/members/view/' + member.member_id);
						}
						

					});
			    }
			});
		} else {
			res.redirect("/");
		}
	});
});


router.get("/add-volunteer/:member_id", Auth.isLoggedIn, Auth.isAdmin, function(req, res){
	Members.getById(req.params.member_id, function(err, member){
		if(member[0] && !err){
			res.render("members/add-volunteer", {
				member: member[0],
				membersActive: true,
				title: "Add Volunteer"
			})
		} else {
			req.flash("error", "Member not found!")
			res.redirect("/members");
		}
	})
});

router.post("/add-volunteer/:member_id", Auth.isLoggedIn, Auth.isAdmin, function(req, res){

	Members.getById(req.params.member_id, function(err, members){
		if(member[0] && !err) {

			var emergencyContactRelation = req.body.emergencyContactRelation.trim();
			var emergencyContactPhoneNo = req.body.emergencyContactPhoneNo.trim();

			req.checkBody("emergencyContactRelation", "Please enter the emergency contact's relation to the member").notEmpty();
			req.checkBody("emergencyContactPhoneNo", "Please make sure you have explained our Safe Space policy").notEmpty();

		} else {
			req.flash("error", "Member not found!")
			res.redirect("/members");			
		}
	})

});

router.get('/renew/:member_id/:length', Auth.isLoggedIn, function(req, res){


	var member_id = req.params.member_id;
	var length = req.params.length;

	if(length == "12") {
		length = "full_year";
	} else if(length == "6") {
		length = "half_year";
	}

	Members.renew(member_id, length, function(err, member){
		if(err){
			req.flash('error_msg', 'Something went wrong!');
			res.redirect("/members/view/" + member_id);
		} else {
			req.flash('success_msg', 'Membership renewed!');
			res.redirect("/members/view/" + member_id);
		}

	});
});

router.get('/remove/:member_id', Auth.isLoggedIn, function(req, res){


	var member_id = req.params.member_id;

	Members.updateStatus(member_id, 0, function(err){
		if(err){

			req.flash('error_msg', 'Something went wrong!');
			res.redirect("/members/view/" + member_id);
		} else {
			req.flash('success_msg', 'Member removed!');
			res.redirect("/members");
		}
	});
});

router.get('/restore/:member_id', Auth.isLoggedIn, function(req, res){


	var member_id = req.params.member_id;
	Members.getById(member_id, function(err, member){
		var today = new Date();
		var membership_init = new Date(member[0].current_init_membership);
		var membership_exp = new Date(member[0].current_exp_membership);
		if(today >= membership_init  && today <= membership_exp){
			Members.updateStatus(member_id, 1, function(err){
				if(err){

					req.flash('error_msg', 'Something went wrong!');
					res.redirect("/members/view/" + member_id);
				} else {
					req.flash('success_msg', 'Membership restored!');
					res.redirect("/members/view/" + member_id);
				}
			});
		} else {
			req.flash('error_msg', 'Membership not in date, please renew');
			res.redirect("/members/view/" + member_id);			
		}
	});
});

router.get('/destroy/:member_id', Auth.isLoggedIn, Auth.isAdmin, function(req, res){


	var member_id = req.params.member_id;

	Members.redact(member_id, function(err){
		if(err){

			req.flash('error_msg', 'Something went wrong!');
			res.redirect("/members/view/" + member_id);
		} else {
			req.flash('success_msg', 'Member destroyed!');
			res.redirect("/members");
		}
	});
});

router.get('/id-remind/:member_id', Auth.isLoggedIn, Auth.isAdmin, function(req, res){
	Members.getById(req.params.member_id, function(err, member){
		if(!member[0] || err){
			req.flash("error", "Member not found");
			res.redirect("/members");
		} else {
			Mail.sendAutomated("membership_id_reminder", member[0].member_id, function(err){
				if(err){
					console.log(err);
					req.flash("error", "Something went wrong!");
					res.redirect("/members");
				} else {
					req.flash("success_msg", "Member has been sent their ID");
					res.redirect("/members/" + req.params.member_id);					
				}
			})
		}
	})
})

module.exports = router;