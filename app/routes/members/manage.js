// /members/manage

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Members = Models.Members;

const Auth = require(rootDir + "/app/controllers/auth");

router.get("/", Auth.canAccessPage("members", "view"), async (req, res) => {
  try {
    const { membersArray } = await Members.getAll();

    const sanitizedMembers = [];

    for await (const member of membersArray) {
      const sanitizedMember = await Members.sanitizeMember(member, req.user);
      if (sanitizedMember) {
        sanitizedMembers.push(sanitizedMember);
      }
    }

    res.render("members/manage", {
      title: "Manage Members",
      members: sanitizedMembers,
      totalMembers: sanitizedMembers.length,
      membersActive: true,
    });
  } catch (error) {
    res.redirect(process.env.PUBLIC_ADDRESS + "/error");
  }
});

module.exports = router;
