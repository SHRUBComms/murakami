// /api/get/tills/stock

const router = require("express").Router();

router.use("/get-records", require("./get-records"));

module.exports = router;
