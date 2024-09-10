const rootDir = process.env.CWD;

const Validators = require(rootDir + "/app/controllers/validators");

const validateWorkingGroup = async (loggedInUser, submittedForm) => {
  await Validators.string(
    { name: "group name", indefiniteArticle: "a", value: submittedForm.name },
    { required: true, minLength: 0, maxLength: 21 }
  );
  await Validators.string(
    { name: "group prefix", indefiniteArticle: "a", value: submittedForm.prefix },
    { required: false, minLength: 0, maxLength: 11 }
  );
  await Validators.string(
    { name: "welcome message", indefiniteArticle: "a", value: submittedForm.welcomeMessage },
    { required: false, minLength: 0, maxLength: 1001 }
  );
  if (submittedForm.parent) {
    if (
      !loggedInUser.allWorkingGroupsObj[submittedForm.parent] ||
      loggedInUser.allWorkingGroupsObj[submittedForm.group_id].children
    ) {
      throw "Please select a valid parent";
    }
  }

  return true;
};

module.exports = validateWorkingGroup;
