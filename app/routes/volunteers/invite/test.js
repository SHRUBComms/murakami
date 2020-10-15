router.post(
  "/",
  Auth.isLoggedIn,
  Auth.canAccessPage("volunteers", "invite"),
  function(req, res) {
    	let first_name = req.body.first_name;
    	let last_name = req.body.last_name;
    	let email = req.body.email;
    	let roles = [];
    	let organisations = req.body.organisations;
    	let assignedCoordinators = [req.user.id];

	try {
		if(!first_name) {
			throw "Please enter first name";
		}

		if(!last_name) {
			throw "Please enter last name";
		}

		if(!validator.validate(email)) {
			throw "Please enter a valid email"
		}

		const defaultFoodCollectorRoleId = await Settings.getById("defaultFoodCollectorRole");

		console.log(defaultFoodCollectorRoleId);

	} catch(error) {
		let errorMessage = "Something went wrong! Please try again";
		if(typeof error === String) {
			errorMessage = error;
		}

		req.flash("error_msg", errorMessage);
		res.redirect(
			process.env.PUBLIC_ADDRESS + "/volunteers/invite?callback=true"
		);
  })
