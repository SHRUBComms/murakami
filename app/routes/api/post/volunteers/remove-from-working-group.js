// /api/post/volunteers/remove-from-working-group

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Members = Models.Members;
const Volunteers = Models.Volunteers;

const Auth = require(rootDir + "/app/configs/auth");

router.post("/", Auth.isLoggedIn, Auth.canAccessPage("volunteers", "update"), async (req, res) => {
  try {

    if (!req.body.member_id) {
      throw "Please specify a member";
    }

    if(!req.body.group_id) {
      throw "Please specify a working group";
    }

    const member_id = req.body.member_id.trim();
    const group_id = req.body.group_id.trim().toUpperCase();

    let volunteer = await Volunteers.getVolunteerById(member_id, req.user);
    
    if (!volunteer) {
      throw "Member is not a volunteer";
    }
    
    if (!volunteer.canUpdate) {
      throw "You don't have permission to remove this volunteer";
    }
    
    let rolesToRemove = [];

    if (volunteer.old_working_groups.includes(group_id)) {
      volunteer.old_working_groups.splice(volunteer.old_working_groups.indexOf(group_id), 1);
    }

    await Members.updateWorkingGroups(member_id, volunteer.old_working_groups);

    for await (let role of volunteer.roles) {
    
      if (req.user.allVolunteerRoles[role]) {
        role = req.user.allVolunteerRoles[role];
        if (role.group_id == group_id || (group_id == "MY-VOLUNTEERS" && req.user.working_groups.includes(role.group_id))) {
          rolesToRemove.push(role.role_id);
        }
      }
    }
    
    for await (const role_id of rolesToRemove) {
      volunteer.roles.splice(volunteer.roles.indexOf(role_id));
    }
    
    await Volunteers.updateRoles(member_id, volunteer.roles);
    
    res.send({ status: "ok", msg: "Volunteer removed" });
  } catch (error) {
    if(typeof error != "string") {
      error = "Something went wrong! Plese try again";
    }
    res.send({ status: "fail", msg: error });
  }
});

module.exports = router;
