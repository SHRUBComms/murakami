// /recover

const router = require("express").Router();
const moment = require("moment");
moment.locale("en-gb");

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");

const Users = Models.Users;
const PasswordReset = Models.PasswordReset;
const Settings = Models.Settings;
const Mail = require(rootDir + "/app/controllers/mail/root");

router.get("/", async (req, res) => {
  try {
    const settings = await Settings.getAll();

    if (settings.passwordReset.data != true) {
      throw "Account recovery is disabled";
    }

    res.render("recover", {
      title: "Account Recovery",
    });
  } catch (error) {
    res.redirect(process.env.PUBLIC_ADDRESS + "/");
  }
});

router.post("/", async (req, res) => {
  let settings;

  try {
    settings = await Settings.getAll();

    if (settings.passwordReset.data != true) {
      throw "Account recovery disabled";
    }

    let email = req.body.email;

    if (!email) {
      throw "Please enter a username or email address";
    }

    const user = await Users.getByUsernameOrEmail(email);

    if (!user) {
      throw "Account not found";
    }

    if (user.deactivated != 0) {
      throw "Account is deactivated";
    }

    const previousPasswordResetsQuery = {
      where: {
        used: 0,
        user_id: user.id,
        date_issued: {
          [Models.Sequelize.Op.gte]: moment().subtract(60, "minutes").toDate(),
        },
      },
    };

    const resets = await PasswordReset.findAll(previousPasswordResetsQuery);

    if (resets[0]) {
      throw "Account recovery process has already been started!";
    }

    const resetToken = await PasswordReset.addPasswordReset(
      user.id,
      req.headers["x-forwarded-for"] || req.connection.remoteAddress
    );

    const name = user.first_name + " " + user.last_name;
    email = user.email;
    const subject = "Account Recovery";
    const html = `<h1>Hey ${user.first_name}!</h1>
				<p>Recover your Murakami account using the following link: <a href="${process.env.PUBLIC_ADDRESS}/recover/${resetToken.reset_code}">${process.env.PUBLIC_ADDRESS}/recover/${resetToken.reset_code}</a></p>
				<p>This link will expire in one hour.</p>`;

    await Mail.sendUsers(name, email, subject, html);
    req.flash("success_msg", "An email with recovery instructions has been sent!");
    res.redirect(process.env.PUBLIC_ADDRESS + "/recover");
  } catch (error) {
    console.error(error);
    if (typeof error != "string") {
      error = "Something went wrong! Please try again";
    }
    res.render("recover", {
      error: error,
      settings: settings,
    });
  }
});

router.get("/:resetToken", async (req, res) => {
  try {
    const passwordReset = await PasswordReset.findOne({
      where: {
        reset_code: req.params.resetToken,
        used: 0,
        date_issued: {
          [Models.Sequelize.Op.gte]: moment().subtract(24, "hours").toDate(),
        },
      },
    });

    if (!passwordReset) {
      throw "Invalid account recovery link";
    }

    res.render("reset", {
      title: "Account Recovery",
      reset_code: req.params.resetToken,
    });
  } catch (error) {
    res.redirect(process.env.PUBLIC_ADDRESS + "/");
  }
});

router.post("/:resetToken", async (req, res) => {
  const password = req.body.password;
  const passwordConfirm = req.body.passwordConfirm;

  try {
    if (!password) {
      throw "Please enter a password";
    }

    if (!passwordConfirm) {
      throw "Please confirm your new password";
    }

    if (password != passwordConfirm) {
      throw "Passwords don't match";
    }

    if (!password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/)) {
      throw "Please enter a valid password";
    }

    const passwordReset = await PasswordReset.findOne({
      where: {
        reset_code: req.params.resetToken,
        used: 0,
        date_issued: {
          [Models.Sequelize.Op.gte]: moment().subtract(60, "minutes").toDate(),
        },
      },
    });

    if (!passwordReset) {
      throw "Invalid account recovery link";
    }

    const user = await Users.getById(passwordReset.user_id, {
      permissions: { users: { name: true } },
    });

    if (!user) {
      throw "Invalid account recovery link";
    }

    if (user.deactivated == 1) {
      throw "Invalid account recovery link";
    }

    await Users.updatePassword(user.id, password);
    await PasswordReset.update({ used: 1 }, { where: { reset_code: passwordReset.reset_code } });

    req.flash("success_msg", "Password reset! You can now login.");
    res.redirect(process.env.PUBLIC_ADDRESS + "/login");
  } catch (error) {
    if (typeof error != "string") {
      error = "Something went wrong - please try again!";
    }
    req.flash("error_msg", error);
    res.redirect(process.env.PUBLIC_ADDRESS + "/recover/" + req.params.resetToken);
  }
});

module.exports = router;
