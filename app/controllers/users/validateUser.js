const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Users = Models.Users;

const Helpers = require(rootDir + "/app/helper-functions/root");
const Validators = require(rootDir + "/app/controllers/validators");

const validateUser = async (loggedInUser, submittedForm) => {
	try {

  		let validClasses, validWorkingGroups;

  		if (loggedInUser.class == "admin") {
    			validClasses = ["admin", "till", "volunteer", "staff"];
  		} else if (loggedInUser.class == "staff") {
    			validClasses = ["till", "volunteer", "staff"];
  		}

  		if (loggedInUser.permissions.users.add == true) {
    			validWorkingGroups = loggedInUser.allWorkingGroupsFlat;
  		} else if (loggedInUser.permissions.users.add == "commonWorkingGroup") {
    			validWorkingGroups = loggedInUser.working_groups;
  		}

		if(submittedForm.working_groups.length == 0) {
			throw "Please select at least 1 working group";
		}

		if(!Helpers.allBelongTo(submittedForm.working_groups, validWorkingGroups)) {
			throw "Please select valid working groups";
		}

  		if (!validClasses.includes(submittedForm.class)) {
    			throw "Please select a valid user class";
  		}

		await Validators.string({ name: "first name", indefiniteArticle: "a", value: submittedForm.first_name }, { required: true, minLength: 0, maxLength: 21});
		await Validators.string({ name: "last name", indefiniteArticle: "a", value: submittedForm.last_name }, { required: true, minLength: 0, maxLength: 31});
		await Validators.string({ name: "email address", indefiniteArticle: "an", value: submittedForm.email }, { required: true, minLength: 4, maxLength: 90});
		await Validators.string({ name: "username", indefiniteArticle: "a", value: submittedForm.username }, { required: true, minLength: 0, maxLength: 21});

		if(!submittedForm.username.match(/^[A-Za-z0-9]+(?:[._-][A-Za-z0-9]+)*$/)) {
			throw "Please enter a valid username"
		}

		if(!submittedForm.email.match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/)) {
			throw "Please enter a valid email address"
		}

		return true;

	} catch (error) {
		throw error;
	}
};

module.exports = validateUser;
