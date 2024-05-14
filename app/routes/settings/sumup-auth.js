// /settings/sumup-auth

const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const passport = require("passport");
const OAuth2Strategy = require("passport-oauth2").Strategy;
require("dotenv").config();
const Models = require("../../models/sequelize");
const Settings = Models.Settings;

// const updateSettings = require("../../models/settings/methods/updateSetting");
// const getSettingById = require("../../models/settings/methods/getById");

const rootDir = process.env.CWD;
const Auth = require(rootDir + "/app/controllers/auth");

router.get(
  "/",
  Auth.isLoggedIn,
  Auth.isOfClass(["admin"]),
  async (req, res) => {
    res.render("settings/sumup-auth", {
      title: "Sumup Authentication",
    });
  }
);

// Configure Passport for SumUp OAuth2
passport.use(
  "sumup",
  new OAuth2Strategy(
    {
      authorizationURL: "https://api.sumup.com/authorize",
      tokenURL: "https://api.sumup.com/token",
      clientID: process.env.SUMUP_CLIENT_ID,
      clientSecret: process.env.SUMUP_CLIENT_SECRET,
      callbackURL: process.env.PUBLIC_ADDRESS + "/settings/sumup-auth/callback",
      state: true,
      passReqToCallback: true,
    },
    function (req, accessToken, refreshToken, profile, cb) {
      const authorizationCode = req.query.code; // Accessing the code directly from the request query
      const encryptedSumupOauth2Keys = {
        refreshToken: encrypt(refreshToken),
        code: encrypt(authorizationCode),
      };
      saveEncryptedSumupOauth2Keys({ encryptedData: encryptedSumupOauth2Keys });
      console.log({ encryptedSumupOauth2Keys });
      return cb(null);
    }
  )
);

// Redirect to SumUp login
router.get(
  "/auth",
  Auth.isLoggedIn,
  Auth.isOfClass(["admin"]),
  (req, res, next) => {
    passport.authenticate("sumup", {
      scope: "transactions.history user.profile_readonly user.app-settings",
    })(req, res, next);
  }
);
// SumUp OAuth2 callback handler
router.get(
  "/callback",
  passport.authenticate("sumup", {
    failureRedirect: "/settings/sumup-auth",
    successRedirect: "/settings/sumup-auth/success",
  })
);

router.get(
  "/auth",
  Auth.isLoggedIn,
  Auth.isOfClass(["admin"]),
  async (req, res) => {
    res.redirect(process.env.PUBLIC_ADDRESS + "/settings/sumup-auth/auth");
  }
);

function encrypt(text) {
  const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, "base64");
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, "utf8", "base64");
  encrypted += cipher.final("base64");
  return iv.toString("base64") + ":" + encrypted;
}

/**
 * Saves or updates encrypted SumUp OAuth2 keys in the database.
 * @param {Object} encryptedData - The encrypted data to be saved.
 */
async function saveEncryptedSumupOauth2Keys({ encryptedData }) {
  try {
    const setting = await Settings.getById("encryptedSumupOauth2Keys");
    
    if (setting) {
      // If the record exists, update it
      const updatedSetting = await Settings.updateSetting(
        "encryptedSumupOauth2Keys",
        encryptedData
      );
      console.log("Updated existing record:", updatedSetting);
    } else {
      // If the record does not exist, create it
      const newSetting = await Settings.updateSetting(
        "encryptedSumupOauth2Keys",
        encryptedData
      );
      console.log("Created new record:", newSetting);
    }
  } catch (error) {
    console.error("Error accessing the database:", error);
  }
}

module.exports = router;
