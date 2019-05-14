var http = require("http");
var async = require("async");
var fs = require("fs");
var lodash = require("lodash");

var Helpers = {};

fs.readdirSync(process.env.CWD + "/app/helper-functions").forEach(function(
  functionName
) {
  // Remove file format.
  functionName = functionName
    .split(".")
    .slice(0, -1)
    .join(".");

  Helpers[functionName] = require(process.env.CWD +
    "/app/helper-functions/" +
    functionName);
});

module.exports = Helpers;
