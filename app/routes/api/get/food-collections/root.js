// /api/get/food-collections/

var router = require("express").Router();
var async = require("async");
var moment = require("moment");
moment.locale("en-gb");
var sanitizeHtml = require("sanitize-html");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");

var FoodCollections = Models.FoodCollections;
var FoodCollectionsOrganisations = Models.FoodCollectionsOrganisations;
var Members = Models.Members;

var Auth = require(rootDir + "/app/configs/auth");

router.use("/organisations", require("./organisations/root"));

module.exports = router;
