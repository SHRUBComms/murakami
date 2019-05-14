module.exports = function(array) {
  var flatten = function(array) {
    var result = [];
    array.forEach(function(a) {
      result.push(a);
      if (Array.isArray(a.children)) {
        result = result.concat(flatten(a.children));
      }
    });
    return result;
  };
  return flatten;
};
