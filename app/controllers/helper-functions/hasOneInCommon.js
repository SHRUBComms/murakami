module.exports = function(haystack, arr) {
  if (!Array.isArray(arr)) {
    arr = [arr];
  }

  if (!Array.isArray(haystack)) {
    haystack = [haystack];
  }

  return arr.some(function(v) {
    return haystack.indexOf(v) >= 0;
  });
};
