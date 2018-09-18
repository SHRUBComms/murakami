// /members/add

var router = require("express").Router();
var Mailchimp = require('mailchimp-api-v3');
var md5 = require('md5');

var rootDir = process.env.CWD;

var Members = require(rootDir + "/app/models/members");
var WorkingGroups = require(rootDir + "/app/models/working-groups");
var Settings = require(rootDir + "/app/models/settings");
var AccessTokens = require(rootDir + "/app/models/access-tokens");
var Transactions = require(rootDir + "/app/models/transactions");

var Auth = require(rootDir + "/app/configs/auth");
var Mail = require(rootDir + "/app/configs/mail");

router.get('/', function(req, res) {
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

router.post('/', function (req, res) {
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

				    		Members.updateWorkingGroups(member.member_id, JSON.stringify(formattedWorkingGroups.sort()), function(){});

				    		
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

					    Mail.sendAutomated("hello", member.member_id, function(err){
							req.flash('success_msg', 'New member added!');
							if(req.query.token){
								// TODO: mark token as used
								AccessTokens.markAsUsed(req.query.token, function(err){
									res.redirect('/success');
								});
							} else {
								res.redirect('/members/view/' + member.member_id);
							}					    	
					    })

					});
			    }
			});
		} else {
			res.redirect("/");
		}
	});
});

module.exports = router;