module.exports = function(Reports, sequelize, DataTypes) {
  return function(subject, report, callback) {
    Reports.create({
      date: new Date(),
      subject: subject,
      report: report
    }).nodeify(function(err) {
      callback(err);
    });
  };
};
