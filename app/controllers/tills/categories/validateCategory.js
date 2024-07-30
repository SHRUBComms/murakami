const rootDir = process.env.CWD;

const Helpers = require(rootDir + "/app/controllers/helper-functions/root");
const Validators = require(rootDir + "/app/controllers/validators");

const sanitizeCategory = async (category, stockCategories, carbonCategories) => {
  await Validators.string({ name: "category name", indefiniteArticle: "a", value: category.name }, { required: true, minLength: 0, maxLength: 51});
  await Validators.number({ name: "member discount", indefiniteArticle: "a", value: category.member_discount }, { required: true, min: 0, max: 100});
  await Validators.number({ name: "weight", indefiniteArticle: "a", value: category.weight }, { required: false, min: 0.1, max: 1000000});
  await Validators.number({ name: "value", indefiniteArticle: "a", value: category.value }, { required: false, min: 0.01, max: 4000});

  if (category.carbon_id && !carbonCategories[category.carbon_id]) {
    throw "Select a valid carbon category or leave blank";
  }

  if (category.parent && !stockCategories[category.parent]) {
    throw "Select a valid parent or leave blank";
  }
  
  /*if (category.value && category.value < 0.01) {
    throw "Enter a valid set value or leave blank";
  }*/

  if(!["0", "1"].includes(category.allowTokens)) {
    throw "Please check if tokens can be used to buy this item";
  }

  if(!["0", "1"].includes(category.stockControl)) {
    throw "Please check if stock control should be enabled";
  }

  if (category.stockControl == 1 && !Array.isArray(category.conditions)) {
    throw "Please select valid item conditions";
  }

  if(category.stockControl == 1 && category.conditions.length == 0) {
    throw "Please select at least one item condition";
  }


  if (category.stockControl == 1 && !Helpers.allBelongTo(category.conditions, Helpers.validItemConditions())) {
    throw "Please select valid item conditions"
  }

  return true;
};

module.exports = sanitizeCategory;
