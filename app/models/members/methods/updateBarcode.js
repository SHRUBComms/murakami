module.exports = function (Members, sequelize, DataType) {
  return function (member_id, barcode, callback) {
    Members.update({ barcode: barcode }, { where: { member_id: member_id } }).nodeify(callback);
  };
};
