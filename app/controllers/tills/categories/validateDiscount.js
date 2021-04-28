const rootDir = process.env.CWD;

const Helpers = require(rootDir + "/app/controllers/helper-functions/root");
const Validators = require(rootDir + "/app/controllers/validators");

const sanitizeCategory = async (category, stockCategories) => {
  await Validators.string({ name: "discount name", indefiniteArticle: "a", value: category.name }, { required: true, minLength: 0, maxLength: 31});
  await Validators.number({ name: "discount amount", indefiniteArticle: "a", value: category.value }, { required: true, min: 0, max: 100 });

  if (category.parent && !stockCategories[category.parent]) {
    throw "Select a valid parent or leave blank";
  }
  
  return true;
};

module.exports = sanitizeCategory;
