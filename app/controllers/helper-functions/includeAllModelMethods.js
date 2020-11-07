const fs = require("fs");

module.exports = (Model, sequelize, DataTypes, methodsDir) => {
  fs.readdirSync(methodsDir).forEach((methodName) => {
    methodName = methodName.split(".").slice(0, -1).join(".");
    Model[methodName] = require(methodsDir + methodName)(Model, sequelize, DataTypes);
  });
};
