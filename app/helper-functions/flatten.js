module.exports = function(array) {
  var result = [];
  array.forEach(function(a) {
    result.push(a);
    if (Array.isArray(a.children)) {
      result = result.concat(Helpers.flatten(a.children));
    }
  });
  return result;
};
