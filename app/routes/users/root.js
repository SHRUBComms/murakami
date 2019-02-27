// /users

var router = require("express").Router();

router.get("/", function(req, res){
  res.redirect(process.env.PUBLIC_ADDRESS + "/users/manage")
})

router.use("/add", require("./add"));
router.use("/update", require("./update"));
router.use("/manage", require("./manage"));
router.use("/deactivate", require("./deactivate"));
router.use("/change-password", require("./change-password"));

module.exports = router;
