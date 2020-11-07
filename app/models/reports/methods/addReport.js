module.exports = (Reports) => {
  return async (subject, report) => {
    return Reports.create({
      date: new Date(),
      subject: subject,
      report: report
    });
  }
};
