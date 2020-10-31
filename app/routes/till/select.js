// /till/select

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Tills = Models.Tills;

const Auth = require(rootDir + "/app/configs/auth");

router.get("/", Auth.isLoggedIn, Auth.canAccessPage("tills", "processTransaction"), async (req, res) => {
  try {
    const { tills } = await Tills.getAll();
    let allowedTills = [];

    for await (const till of tills) {
      if ((req.user.permissions.tills.viewTill == true && till.disabled == 0) || (req.user.permissions.tills.viewTill == "commonWorkingGroup" && req.user.working_groups.includes(till.group_id) && till.disabled == 0)) {
        allowedTills.push(till);
      }    
    }
    
    if (allowedTills.length == 0) {
      throw "No tills available.";
    } else if (allowedTills.length == 1) {
      res.render("till/root", {
        tillMode: true,
        title: "Select A Till",
        tills: allowedTills
      });
    }
  } catch (error) {
    res.render("till/root", {
      tillMode: true,
      errors: [{ msg: "No tills are available. Please contact an administrator." }],
      title: "Select A Till",
      tills: []
    });
  }
});

module.exports = router;
