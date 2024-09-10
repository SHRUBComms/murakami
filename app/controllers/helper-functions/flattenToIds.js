module.exports = async (array, id) => {
  const flatArray = [];
  for await (const obj of array) {
    flatArray.push(obj[id]);
  }

  return flatArray;
};
