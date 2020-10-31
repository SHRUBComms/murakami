// /working-groups/manage

const router = require("express").Router();
const h2p = require("html2plaintext");

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const WorkingGroups = Models.WorkingGroups;

const Auth = require(rootDir + "/app/configs/auth");
const validateWorkingGroup = require(rootDir + "/app/controllers/working-groups/validateWorkingGroup");

router.get("/", Auth.isLoggedIn, Auth.canAccessPage("workingGroups", "view"), async (req, res) => {
    if (req.user.working_groups.length > 0) {
      const group = req.user.working_groups[0];
      res.redirect(process.env.PUBLIC_ADDRESS + "/working-groups/manage/" + group);
    } else {
      res.redirect(process.env.PUBLIC_ADDRESS + "/");
    }
  }
);

router.get("/:group_id", Auth.isLoggedIn, Auth.canAccessPage("workingGroups", "view"), async (req, res) => {
  try {
    if (!(req.user.permissions.workingGroups.view == true || (req.user.permissions.workingGroups.view == "commonWorkingGroup" && req.user.working_groups.includes(req.params.group_id)))) {
      throw "You don't have permission to view this working group";
    }

    let canUpdate = false;
    if (req.user.permissions.workingGroups.update == true || (req.user.permissions.workingGroups.update == "commonWorkingGroup" && req.user.working_groups.includes(req.params.group_id))) {
      canUpdate = true;
    }

    if (!req.user.allWorkingGroupsObj[req.params.group_id]) {
      throw "Working group not found";
    }
    
    res.render("working-groups/manage", {
      title: "Working Group Settings",
      workingGroupsActive: true,
      group: req.user.allWorkingGroupsObj[req.params.group_id],
      canUpdate: canUpdate
    });
  } catch (error) {
    res.redirect(process.env.PUBLIC_ADDRESS + "/");
  }  
});

router.post("/:group_id", Auth.isLoggedIn, Auth.canAccessPage("workingGroups", "update"), async (req, res) => {
  try {
    if (!(req.user.permissions.workingGroups.update == true || (req.user.permissions.workingGroups.update == "commonWorkingGroup" && req.user.working_groups.includes(req.params.group_id)))) {
      throw "You don't have permission to update this working group";
    }

    const group = req.user.allWorkingGroups[req.params.group_id];
    
    if (!group) {
      throw "Working group not found";
    }
    
    let sanitizedGroup = {
      group_id: req.params.group_id,
      name: req.body.name,
      prefix: req.body.prefix,
      parent: req.body.parent,
      welcomeMessage: req.body.welcomeMessage
    }

    await validateWorkingGroup(req.user, sanitizedGroup);
    
    if (h2p(sanitizedGroup.welcomeMessage)) {
      sanitizedGroup.welcomeMessage = sanitizedGroup.welcomeMessage.replace(/\r?\n|\r/g, "");
    } else {
      group.welcomeMessage = null;
    }
    
    await WorkingGroups.updateGroup(group);
    req.flash("success_msg", "Group successfully updated!");
    res.redirect(process.env.PUBLIC_ADDRESS + "/working-groups/manage/" + req.params.group_id);
  } catch (error) {
    if(typeof error != "string") {
      error = "Something went wrong! Please try again";
    } 

    req.flash("error_msg", error);
    res.redirect(process.env.PUBLIC_ADDRESS + "/working-groups/manage/" + req.params.group_id);
  }
});

module.exports = router;
