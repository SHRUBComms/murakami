// /settings/data-permissions

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const DataPermissions = Models.DataPermissions;

const Auth = require(rootDir + "/app/controllers/auth");

const userClasses = ["till", "volunteer", "staff", "admin"];

router.get("/", Auth.isLoggedIn, Auth.isOfClass(["admin"]), async (req, res) => {
  res.redirect(process.env.PUBLIC_ADDRESS + "/settings/data-permissions/" + userClasses[0]);
});

router.get("/:user_class", Auth.isLoggedIn, Auth.isOfClass(["admin"]), async (req, res) => {
  try {
    if (!userClasses.includes(req.params.user_class)) {
      throw "Class not found";
    }

    const permissions = await DataPermissions.getAll();
    const orderedPermissions = {};
    Object.keys(permissions[req.params.user_class])
      .sort()
      .forEach((key) => (orderedPermissions[key] = permissions[req.params.user_class][key]));

    res.render("settings/data-permissions", {
      title: "Data Permissions",
      settingsActive: true,
      permissions: orderedPermissions,
      userClass: req.params.user_class,
    });
  } catch (error) {
    res.redirect(process.env.PUBLIC_ADDRESS + "/settings/data-permissions/" + userClasses[0]);
  }
});

router.post("/:user_class", Auth.isLoggedIn, Auth.isOfClass(["admin"]), async (req, res) => {
  try {
    if (!userClasses.includes(req.params.user_class)) {
      throw "User class doesn't exist";
    }

    const validPermissions = ["true", "false", "commonWorkingGroup", "isCoordinator"];
    const newPermissions = req.body.permissions;
    const sanitizedPermissions = {};

    let permissions = await DataPermissions.getAll();
    permissions = permissions[req.params.user_class];

    for await (const subjectKey of Object.keys(permissions)) {
      const subject = permissions[subjectKey];
      if (!newPermissions[subjectKey]) {
        sanitizedPermissions[subjectKey] = permissions[subjectKey];
        continue;
      }

      sanitizedPermissions[subjectKey] = {};

      for await (const specificKey of Object.keys(subject)) {
        sanitizedPermissions[subjectKey][specificKey] = false;

        if (validPermissions.includes(newPermissions[subjectKey][specificKey])) {
          try {
            sanitizedPermissions[subjectKey][specificKey] = JSON.parse(
              newPermissions[subjectKey][specificKey]
            );
          } catch (error) {
            sanitizedPermissions[subjectKey][specificKey] = newPermissions[subjectKey][specificKey];
          }
        }
      }
    }

    await DataPermissions.updatePermission(req.params.user_class, sanitizedPermissions);
    req.flash("success_msg", "Permissions updated!");
    res.redirect(
      process.env.PUBLIC_ADDRESS + "/settings/data-permissions/" + req.params.user_class
    );
  } catch (error) {
    req.flash("error_msg", "Something went wrong! Please try again.");
    res.redirect(process.env.PUBLIC_ADDRESS + "/settings/data-permissions/");
  }
});

module.exports = router;
