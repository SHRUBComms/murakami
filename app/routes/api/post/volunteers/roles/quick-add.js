// /api/post/volunteers/roles/quick-add

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const VolunteerRoles = Models.VolunteerRoles;

const Auth = require(rootDir + "/app/configs/auth");

router.post("/", Auth.isLoggedIn, Auth.canAccessPage("volunteerRoles", "quickAdd"), async (req, res) => {
  try {
    const working_group = req.body.working_group;
    const title = req.body.title;
  
    let validWorkingGroups;
    if (req.user.permissions.volunteerRoles.quickAdd == true) {
      validWorkingGroups = req.user.allWorkingGroupsFlat;
    } else if (req.user.permissions.volunteerRoles.quickAdd == "commonWorkingGroup") {
      validWorkingGroups = req.user.working_groups;
    }

    if (!validWorkingGroups.includes(working_group)){
      throw "Please enter a valid working group";
    } 

    if(!title) {
      throw "Please enter a role title";
    }
    
    const role = await VolunteerRoles.quickAddRole(working_group, title);
    res.send({ status: "ok", role: role });
  } catch (error) {
    if(typeof error != "string") {
      error = "Something went wrong! Please try again";
    }
    
    res.send({ status: "fail", msg: error });
  }
});

module.exports = router;
