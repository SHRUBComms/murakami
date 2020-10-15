let Validators = {};

Validators.string = async (input, options) => {
	try {

		if(options.required && !input.value) {
			throw `Please enter ${input.indefiniteArticle} ${input.name}`;
		}

		if(typeof input.value != "string") {
			throw `Please enter a valid ${input.name}`;
		}

		if(input.value.length < options.minLength) {
			throw `Please enter ${input.indefiniteArticle} ${input.name} more than ${options.minLength} character(s)`;
		}

		if(input.value.length > options.maxLength) {
			throw `Please enter ${input.indefiniteArticle} ${input.name} less than ${options.minLength} character(s)`;
		}

	} catch (error) {
		throw error;
	}
}

module.exports = Validators;
