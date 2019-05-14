module.exports = function(array, id, callback) {
  var flatArray = [];
  async.each(
    array,
    function(obj, callback) {
      flatArray.push(obj[id]);
      callback();
    },
    function() {
      callback(flatArray);
    }
  );
};
