// /api/post/volunteers

var router = require("express").Router();

router.use("/existence", require("./existence"));
router.use("/roles", require("./roles/root"));
router.use(
  "/remove-from-working-group",
  require("./remove-from-working-group")
);
router.use(
  "/send-food-collection-link",
  require("./send-food-collection-link")
);

module.exports = router;
