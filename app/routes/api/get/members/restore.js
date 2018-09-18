// /api/get/members/restore

var router = require("express").Router();

var rootDir = process.env.CWD;

var Members = require(rootDir + "/app/models/members");

var Auth = require(rootDir + "/app/configs/auth");

router.get('/:member_id', Auth.isLoggedIn, function(req, res){


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

module.exports = router;