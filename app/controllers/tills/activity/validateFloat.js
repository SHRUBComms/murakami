const rootDir = process.env.CWD;

const Validators = require(rootDir + "/app/controllers/validators");

const validateFloat = async (submittedForm) => {
	try {
		await Validators.number({ name: "counted float", indefiniteArticle: "a", value: submittedForm.counted_float }, { required: true, min: 0, max: 500 });
		await Validators.string({ name: "note", indefiniteArticle: "a", value: submittedForm.note }, { required: false, minLength: 0, maxLength: 201 });

		return true;

	} catch (error) {
		console.log(error);
		throw error;
	}
};

module.exports = validateFloat;
