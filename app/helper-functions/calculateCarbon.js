module.exports = function(carbon, carbonCategories, callback) {
  var totalCarbon = 0;

  for (let i = 0; i < carbon.length; i++) {
    carbon[i].trans_object = carbon[i].trans_object;

    Object.keys(carbon[i].trans_object).forEach(function(key) {
      if (carbonCategories[key]) {
        totalCarbon +=
          carbon[i].trans_object[key] *
          carbonCategories[key].factors[carbon[i].method] *
          1e-3;
      }
    });
  }
  callback(totalCarbon);
};
