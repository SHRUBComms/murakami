// /api/post/volunteers/existence

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Volunteers = Models.Volunteers;
const Members = Models.Members;

const Auth = require(rootDir + "/app/controllers/auth");

router.post("/", Auth.canAccessPage("volunteers", "add"), async (req, res) => {
  try {
    const name = `${req.body.first_name} ${req.body.last_name}`;
    const email = req.body.email;

    let member = await Members.searchByNameAndEmail({ name: name, email: email });

    if (!member) {
      throw "Member not found";
    }

    if (member.length == 0) {
      throw "Member not found";
    }

    member = member[0];

    const volunteer = await Volunteers.getVolunteerById(member.member_id, req.user);

    if (volunteer) {
      res.send({ status: "ok", member_id: member.member_id, msg: "volunteer" });
    } else {
      res.send({ status: "ok", member_id: member.member_id, msg: "member" });
    }
  } catch (error) {
    if (typeof error != "string") {
      error = "Something went wrong! Please try again";
    }
    res.send({ status: "fail", msg: error });
  }
});

module.exports = router;
