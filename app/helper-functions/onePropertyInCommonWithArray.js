module.exports = function(object, values, callback) {
  var found = false;
  async.each(
    values,
    function(value, callback) {
      if (object[value]) {
        found = true;
      }
      callback();
    },
    function() {
      callback(found);
    }
  );
};
