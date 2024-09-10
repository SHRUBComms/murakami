// /working-groups/add

const router = require("express").Router();
const h2p = require("html2plaintext");

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const WorkingGroups = Models.WorkingGroups;

const Auth = require(rootDir + "/app/controllers/auth");
const validateWorkingGroup = require(
  rootDir + "/app/controllers/working-groups/validateWorkingGroup"
);

router.get("/", Auth.isLoggedIn, Auth.canAccessPage("workingGroups", "add"), (req, res) => {
  res.render("working-groups/add", {
    title: "Add Working Group",
    workingGroupsActive: true,
  });
});

router.post("/", Auth.isLoggedIn, Auth.canAccessPage("workingGroups", "add"), async (req, res) => {
  let sanitizedGroup = {};
  try {
    sanitizedGroup = {
      name: req.body.name,
      prefix: req.body.prefix,
      parent: req.body.parent || null,
      welcomeMessage: req.body.welcomeMessage,
    };

    await validateWorkingGroup(req.user, sanitizedGroup);

    if (h2p(sanitizedGroup.welcomeMessage)) {
      sanitizedGroup.welcomeMessage = sanitizedGroup.welcomeMessage.replace(/\r?\n|\r/g, "");
    } else {
      sanitizedGroup.welcomeMessage = null;
    }

    const group_id = await WorkingGroups.addWorkingGroup(sanitizedGroup);
    req.flash("success_msg", "Working group added successfully!");
    res.redirect(process.env.PUBLIC_ADDRESS + "/working-groups/manage/" + group_id);
  } catch (error) {
    if (typeof error != "string") {
      error = "Something went wrong! Please try again";
    }

    res.render("working-groups/add", {
      title: "Add Working Group",
      workingGroupsActive: true,
      errors: [{ msg: error }],
      name: sanitizedGroup.name,
      prefix: sanitizedGroup.prefix,
      welcomeMessage: sanitizedGroup.welcomeMessage,
    });
  }
});

module.exports = router;
