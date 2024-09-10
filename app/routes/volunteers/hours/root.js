// /volunteers/hours

const router = require("express").Router();

const rootDir = process.env.CWD;

const Auth = require(rootDir + "/app/controllers/auth");

router.get("/", Auth.isLoggedIn, Auth.isOfClass(["admin"]), async (req, res) => {
  res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/hours/log");
});

router.use("/export", require("./export"));
router.use("/log", require("./log"));

module.exports = router;
