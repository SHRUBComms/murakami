const ExpressRecaptcha = require("express-recaptcha").RecaptchaV3;
const fetch = require("node-fetch");

const Recaptcha = {};

Recaptcha.recaptcha = new ExpressRecaptcha(
  process.env.RECAPTCHA_SITE_KEY,
  process.env.RECAPTCHA_SECRET_KEY
);

Recaptcha.checkRecaptcha = async (recaptchaResponse) => {
  try {
    const response = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaResponse}`,
      { method: "post" }
    );

    const json = await response.json();

    if (json.success == false) {
      throw "Recaptcha failed";
    }

    return true;
  } catch (error) {
    return false;
  }
};

module.exports = Recaptcha;
