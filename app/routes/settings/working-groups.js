// /settings/working-groups

var router = require("express").Router();

var rootDir = process.env.CWD;

var Settings = require(rootDir + "/app/models/settings");
var WorkingGroups = require(rootDir + "/app/models/working-groups");

var Auth = require(rootDir + "/app/configs/auth");

router.get('/', Auth.isLoggedIn, Auth.isAdmin, function (req, res) {

  if(req.user.admin_wg){
    var group = req.user.admin_wg[0].id;
    res.redirect("/settings/working-groups/" + group);
  } else {
    req.flash("error", "You're not an admin of any working groups!");
    res.redirect("/");
  }

});

router.get("/:group_id", Auth.isLoggedIn, Auth.isAdmin, function(req, res){
	Settings.getAll(function(err, settings){
		settings = settings[0];
		settings.definitions = JSON.parse(settings.definitions);
	    WorkingGroups.verifyGroupById(req.params.group_id, settings, function(group){
	      if(group){

	      	console.log(req.user.admin_wg);
		  	res.render('settings/working-groups', {
		  		title: "Working Group Settings",
		  		settingsActive: true,
		  		settings: settings,
		  		group: group
		  	});

	      } else {
	        res.redirect('/error');
	      }
	    }); 
	});	
})

router.post("/:group_id", Auth.isLoggedIn, Auth.isAdmin, function(req, res){
	Settings.getAll(function(err, settings){
		settings = settings[0];
		settings.definitions = JSON.parse(settings.definitions);
	    WorkingGroups.verifyGroupById(req.params.group_id, settings, function(group){
	      if(group){

	      	var name = req.body.name.trim();
	      	var prefix = req.body.prefix.trim();
	      	var rate = req.body.rate || 0;

	      	//sanitize!

			req.checkBody("name", "Please enter a group name").notEmpty();

			if(prefix) {
				req.checkBody("prefix", "Please enter a group name").notEmpty();
			}

			req.checkBody("rate", "Please enter a rate (set to 0 if unwanted)").notEmpty();
			req.checkBody("rate", "Please enter a valid rate (a whole number between 0 and 5)").isInt({ gt: -1, lt: 5 });

			var errors = req.validationErrors();

			if(!errors){

				var index = null;
				for(i=0;i<settings.definitions.working_groups.length;i++){
					if(settings.definitions.working_groups[i].id == group.id){
						index = i;
					}
				}

				if(!isNaN(index)){
					settings.definitions.working_groups[index].prefix = prefix;
					settings.definitions.working_groups[index].name = name;
					settings.definitions.working_groups[index].rate = rate;

			      	Settings.updateDefinitions(JSON.stringify(settings.definitions), function(err){
			      		req.flash("success_msg", "Group successfully updated!");
			      		res.redirect("/settings/working-groups/" + group.id);
			      	})
				} else {
					req.flash("error", "Something went wrong!")
					res.redirect("/settings/working-groups/" + group.id);
				}

		    } else {

		    	group.prefix = prefix;
		    	group.name = name;
		    	group.rate = rate;

			  	res.render('settings/working-groups', {
			  		title: "Working Group Settings",
			  		settingsActive: true,
			  		settings: settings,
			  		group: group
			  	});
		    }

	      } else {
	        res.redirect('/error');
	      }
	    }); 
	});	
})

module.exports = router;