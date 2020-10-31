const flatten = async (array) => {
	let result = [];
  for await (const a of array) {
    result.push(a);
    if (Array.isArray(a.children)) {
      result = result.concat(await flatten(a.children));
    }
	}
	return result;
}

module.exports = flatten;
