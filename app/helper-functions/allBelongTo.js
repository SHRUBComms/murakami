module.exports = function(selectedOptions, validOptions) {
  if (Array.isArray(selectedOptions)) {
    try {
      var valid = true;
      for (i = 0; i < selectedOptions.length; i++) {
        if (!validOptions[validOptions.indexOf(selectedOptions[i])]) {
          valid = false;
        }
      }
      return valid;
    } catch (err) {
      return false;
    }
  } else {
    if (validOptions[validOptions.indexOf(selectedOptions)]) {
      return true;
    } else {
      return false;
    }
  }
};
