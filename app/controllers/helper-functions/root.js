const fs = require("fs");

const Helpers = {};

fs.readdirSync(process.env.CWD + "/app/controllers/helper-functions").forEach((functionName) => {
  // Remove file format.
  functionName = functionName.split(".").slice(0, -1).join(".");

  Helpers[functionName] = require(
    process.env.CWD + "/app/controllers/helper-functions/" + functionName
  );
});

module.exports = Helpers;
