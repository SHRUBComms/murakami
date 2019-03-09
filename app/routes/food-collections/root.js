// /food-collections

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var Members = require(rootDir + "/app/models/members");
var WorkingGroups = require(rootDir + "/app/models/working-groups");

var Auth = require(rootDir + "/app/configs/auth");

router.use("/log", require("./log"));
router.use("/export", require("./export"));
router.use("/review", require("./review"));
router.use("/organisations", require("./organisations/root"));

module.exports = router;
