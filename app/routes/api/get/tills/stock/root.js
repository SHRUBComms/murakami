// /api/get/tills/stock

var router = require("express").Router();

router.use("/get-records", require("./get-records"));

module.exports = router;
