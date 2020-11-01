// /api/post/volunteers

const router = require("express").Router();

router.use("/existence", require("./existence"));
router.use("/roles", require("./roles/root"));
router.use("/food-collections", require("./food-collections/root"));
router.use("/remove-from-working-group", require("./remove-from-working-group"));

module.exports = router;
