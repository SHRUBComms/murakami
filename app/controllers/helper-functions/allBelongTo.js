module.exports = (selectedOptions, validOptions) => {
  if (Array.isArray(selectedOptions) && Array.isArray(validOptions)) {
    try {
      let valid = true;
      for (let i = 0; i < selectedOptions.length; i++) {
        if (!validOptions[validOptions.indexOf(selectedOptions[i])]) {
          valid = false;
        }
      }
      return valid;
    } catch (error) {
      return false;
    }
  } else if (!Array.isArray(selectedOptions) && Array.isArray(validOptions)) {
    if (validOptions[validOptions.indexOf(selectedOptions)]) {
      return true;
    } else {
      return false;
    }
  } else if (!Array.isArray(selectedOptions) && !Array.isArray(validOptions)) {
    if (selectedOptions == validOptions) {
      return true;
    } else {
      return false;
    }
  }
};
