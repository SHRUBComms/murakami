module.exports = function (array1, array2) {
  return array1.filter((value) => -1 !== array2.indexOf(value));
};
