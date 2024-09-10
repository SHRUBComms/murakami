const rootDir = process.env.CWD;
const moment = require("moment");
moment.locale("en-gb");

const Validators = require(rootDir + "/app/controllers/validators");

const validateMember = async (loggedInUser, submittedForm, addingMember) => {
  if (addingMember && !submittedForm.dob) {
    throw "Please enter a date of birth";
  }

  if (addingMember & moment(submittedForm.dob).isAfter(moment().subtract(16, "years"))) {
    throw "You must be at least 16 years old to join";
  }

  if (addingMember && !submittedForm.shrubExplained) {
    throw "Please confirm that you have explained SHRUB's vision";
  }

  if (addingMember && !submittedForm.safeSpace) {
    throw "Please confirm that you have explained our Safer Spaces policy";
  }

  if (addingMember && !submittedForm.membershipBenefits) {
    throw "Please confirm you have explained membership benefits";
  }

  if (addingMember && !submittedForm.contactConsent) {
    throw "Please confirm the prospective member has consented to being contacted by email";
  }

  if (addingMember && !submittedForm.gdprConsent) {
    throw "Please confirm the prospective member has agreed to our privacy policy";
  }

  await Validators.string(
    { name: "first name", indefiniteArticle: "a", value: submittedForm.first_name },
    { required: true, minLength: 0, maxLength: 21 }
  );
  await Validators.string(
    { name: "last name", indefiniteArticle: "a", value: submittedForm.last_name },
    { required: true, minLength: 0, maxLength: 31 }
  );
  await Validators.email({ value: submittedForm.email }, { required: true });
  await Validators.string(
    { name: "address", indefiniteArticle: "an", value: submittedForm.address },
    { required: true, minLength: 0, maxLength: 100 }
  );
  await Validators.string(
    { name: "phone number", indefiniteArticle: "a", value: submittedForm.phone_no },
    { required: false, minLength: 0, maxLength: 14 }
  );

  return true;
};

module.exports = validateMember;
