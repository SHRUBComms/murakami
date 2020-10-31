module.exports = async (array, id) => {
  	let flatArray = [];
	for await (const obj of array) {
		flatArray.push(obj[id]);
	}

	return flatArray;
}
