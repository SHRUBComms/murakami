const Validators = {};

Validators.string = async (input, options) => {
  if (options.required && !input.value) {
    throw `Please enter ${input.indefiniteArticle} ${input.name}`;
  }

  if (input.value) {
    if (typeof input.value != "string") {
      throw `Please enter a valid ${input.name}`;
    }

    if (input.value.length < options.minLength) {
      throw `Please enter ${input.indefiniteArticle} ${input.name} more than ${options.minLength} character(s)`;
    }

    if (input.value.length > options.maxLength) {
      throw `Please enter ${input.indefiniteArticle} ${input.name} less than ${options.maxLength} character(s)`;
    }
  }
};

Validators.number = async (input, options) => {
  if (options.required && !input.value) {
    throw `Please enter ${input.indefiniteArticle} ${input.name}`;
  }

  if (input.value) {
    if (isNaN(input.value)) {
      throw `Please enter a valid ${input.name}`;
    }

    input.value = Number(input.value);

    if (input.value < options.min) {
      throw `Please enter ${input.indefiniteArticle} ${input.name} greater than ${options.min}`;
    }

    if (input.value > options.max) {
      throw `Please enter ${input.indefiniteArticle} ${input.name} less than ${options.max}`;
    }
  }
};

Validators.enum = async (input, options) => {
  if (options.required && !input.value) {
    throw `Please enter ${input.indefiniteArticle} ${input.name}`;
  }

  if (input.value) {
    if (!options.validValues.includes(input.value)) {
      throw `Please enter a valid ${input.name}`;
    }
  }
};

Validators.email = async (input, options) => {
  if (options.required && !input.value) {
    throw "Please enter an email address";
  }

  if (input.value.length < 3 && input.value.length > 89) {
    throw "Please enter a valid email address";
  }

  if (
    !input.value.match(
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    )
  ) {
    throw "Please enter a valid email address";
  }
};

Validators.availability = async (availability, options) => {
  if (options.required && !availability) {
    throw "Please tick at least one box in the availability matrix";
  }

  if (availability) {
    const days = {
      mon: true,
      tue: true,
      wed: true,
      thu: true,
      fri: true,
      sat: true,
      sun: true,
    };

    const periods = { m: true, a: true, e: true };

    let validTimes = 0;

    for await (const key of Object.keys(availability)) {
      let validDay = false;
      let validPeriod = false;

      if (days[key.substring(0, 3)]) {
        validDay = true;
      }

      if (periods[key.substring(4, 5)]) {
        validPeriod = true;
      }

      if (!(validDay && key.substring(3, 4) == "_" && validPeriod)) {
        throw "Please select valid options from the availabiliy matrix";
      }

      validTimes++;
    }

    if (validTimes == 0 && options.required) {
      throw "Please tick at least one box in the availability matrix";
    }
  }

  return;
};

module.exports = Validators;
