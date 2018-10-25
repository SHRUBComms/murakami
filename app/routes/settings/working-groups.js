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


			group.name = group.name.split(': ')[1] || group.name;

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
		console.log(req.params.group_id);

		var group_id = req.params.group_id;
      	var name = req.body.name.trim();
      	var prefix = req.body.prefix.trim() || null;
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

			var found = false;
			for(i=0;i<settings.definitions.working_groups.length;i++){
				if(group_id == settings.definitions.working_groups[i].id){
					found = true;
					settings.definitions.working_groups[i].prefix = prefix;
					settings.definitions.working_groups[i].name = name;
					settings.definitions.working_groups[i].rate = rate;						
				} else {
					if(settings.definitions.working_groups[i].sub_groups){
						for(j=0;j<settings.definitions.working_groups[i].sub_groups.length;j++){
							if(group_id.substring(7, 10) == settings.definitions.working_groups[i].sub_groups[j].id){

								found = true;
								settings.definitions.working_groups[i].sub_groups[j].prefix = prefix;
								settings.definitions.working_groups[i].sub_groups[j].name = name;
								settings.definitions.working_groups[i].sub_groups[j].rate = rate;	
							}
						}
					}
				}
			}
			console.log(found);
			if(found){
		      	Settings.updateDefinitions(JSON.stringify(settings.definitions), function(err){
		      		req.flash("success_msg", "Group successfully updated!");
		      		res.redirect("/settings/working-groups/" + group_id);
		      	})
			} else {
				req.flash("error", "Something went wrong!")
				res.redirect("/settings/working-groups/" + group_id);
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

	});
 
})

module.exports = router;