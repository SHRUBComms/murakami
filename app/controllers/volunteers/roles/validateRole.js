const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Users = Models.Users;

const Helpers = require(rootDir + "/app/controllers/helper-functions/root");
const Validators = require(rootDir + "/app/controllers/validators");

const validateRole = async (loggedInUser, submittedForm, validSelections) => {
    try {
        console.log(submittedForm);
        let validWorkingGroups;

        if (loggedInUser.permissions.volunteerRoles.add == true) {
            validWorkingGroups = loggedInUser.allWorkingGroupsFlat;
        } else if (loggedInUser.permissions.volunteerRoles.add == "commonWorkingGroup") {
            validWorkingGroups = loggedInUser.working_groups;
        }

        if (submittedForm.working_group) {
            if (!validWorkingGroups.includes(submittedForm.working_group)) {
                throw "Please select a valid working group";
            }
        }

        if (!Object.keys(validSelections.commitmentLengths).includes(submittedForm.commitment_length)) {
            throw "Please enter a valid commitment length";
        }

        if (Helpers.allBelongTo(submittedForm.locations, Object.keys(validSelections.locations)) == false) {
            throw "Please make sure you have selected valid locations";
        }

        if (Helpers.allBelongTo(submittedForm.activities, Object.keys(validSelections.activities)) == false) {
            throw "Please make sure you have selected valid activities";
        }

        await Validators.string({
            name: "role title",
            indefiniteArticle: "a",
            value: submittedForm.title
        }, {
            required: true,
            minLength: 0,
            maxLength: 51
        });
        await Validators.string({
            name: "short description",
            indefiniteArticle: "a",
            value: submittedForm.short_description
        }, {
            required: true,
            minLength: 0,
            maxLength: 501
        });
        await Validators.string({
            name: "experience required",
            indefiniteArticle: "the",
            value: submittedForm.experience_required
        }, {
            required: true,
            minLength: 0,
            maxLength: 501
        });
        await Validators.string({
            name: "experience gained",
            indefiniteArticle: "the",
            value: submittedForm.experience_gained
        }, {
            required: true,
            minLength: 0,
            maxLength: 501
        });
        await Validators.number({
            name: "hours per week",
            indefiniteArticle: "the",
            value: submittedForm.hours_per_week
        }, {
            required: true,
            min: 0,
            max: 16
        });
        await Validators.availability(submittedForm.availability);

        return true;

    } catch (error) {
        throw error;
    }
};

module.exports = validateRole;