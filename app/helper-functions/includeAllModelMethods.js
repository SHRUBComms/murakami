var fs = require("fs");

module.exports = function(Model, sequelize, DataTypes, methodsDir) {
  fs.readdirSync(methodsDir).forEach(function(methodName) {
    methodName = methodName
      .split(".")
      .slice(0, -1)
      .join(".");

    Model[methodName] = require(methodsDir + methodName)(
      Model,
      sequelize,
      DataTypes
    );
  });
};
