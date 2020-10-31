const rootDir = process.env.CWD;

const Helpers = require(rootDir + "/app/helper-functions/root");
const Validators = require(rootDir + "/app/controllers/validators");

const validateRole = async (loggedInUser, submittedForm, validSelections) => {
  
  await Validators.string({ name: "emergency contact's relation to the member", indefiniteArticle: "the", value: submittedForm.emergencyContactRelation }, { required: true, minLength: 0, maxLength: 25 });
  await Validators.string({ name: "emergency contact's name", indefiniteArticle: "the", value: submittedForm.emergencyContactName }, { required: true, minLength: 0, maxLength: 25 });
  await Validators.string({ name: "emergency contact's phone number", indefiniteArticle: "the", value: submittedForm.emergencyContactPhoneNo }, { required: true, minLength: 0, maxLength: 25 });

  if(!submittedForm.medicalDisclosed) {
    throw "Please make sure any medical conditions have been disclosed";
  }

  if(!submittedForm.volunteerAgreementAgreed) {
    throw "Please make sure the volunteer agreement has been agreed to";
  }

  await Validators.availability(submittedForm.availability, { required: false });

  let validWorkingGroups;

  if (loggedInUser.permissions.volunteerRoles.add == true) {
      validWorkingGroups = loggedInUser.allWorkingGroupsFlat;
  } else if (loggedInUser.permissions.volunteerRoles.add == "commonWorkingGroup") {
      validWorkingGroups = loggedInUser.working_groups;
  }

  let rolesValid = true;

  if(!submittedForm.roles) {
    throw "Please select at least 1 role";
  }

  if(submittedForm.roles.length == 0) {
    throw "Please select at least 1 role";
  }
  
  for await (const roleId of submittedForm.roles) {
    if (!validSelections.rolesObj[roleId]) {
      rolesValid = false;
      break;
    } else {
      if (!validWorkingGroups.includes(validSelections.rolesObj[roleId].group_id)) {
        rolesValid = false;
        break;
      }
    }
  }

  if(!rolesValid) {
    throw "Please select valid roles";
  }

  if(submittedForm.assignedCoordinator == 0) {
    throw "Please select at least one staff coordinator";
  }

  if (!Helpers.allBelongTo(submittedForm.assignedCoordinators, Object.keys(validSelections.coordinatorsObj))) {
    throw "Please select valid staff coordinators";
  }

  if(submittedForm.survey) {

    await Validators.string({ name: "answer for Q1 of the volunteer survey", indefiniteArticle: "the", value: submittedForm.survey.goals }, { required: false, minLength: 0, maxLength: 250 });
    await Validators.string({ name: "answer for Q2 of the volunteer survey", indefiniteArticle: "the", value: submittedForm.survey.interests }, { required: false, minLength: 0, maxLength: 250 });
    await Validators.string({ name: "answer for Q5 of the volunteer survey", indefiniteArticle: "the", value: submittedForm.survey.additionalNotes }, { required: false, minLength: 0, maxLength: 250 });

    if (submittedForm.survey.skills) {
      if (!Helpers.allBelongTo(submittedForm.survey.skills, Object.keys(validSelections.skills))) {
        throw "Please select valid skills";
      }
    }

    if (submittedForm.survey.preferredCommMethods) {
      if (!Helpers.allBelongTo(submittedForm.survey.preferredCommMethods, Object.keys(validSelections.contactMethods))) {
        throw "Please select valid contact methods"
      }
    }
  }  

  return true;

}

module.exports = validateRole;
