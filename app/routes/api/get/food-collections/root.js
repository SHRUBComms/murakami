// /api/get/food-collections/

const router = require("express").Router();

router.use("/organisations", require("./organisations/root"));

module.exports = router;
