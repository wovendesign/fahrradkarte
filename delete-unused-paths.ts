async function main() {
	const geojson = await Bun.file(
		"src/radverkehrskonzept_zielnetz.geojson",
		"utf8",
	).json();

	console.log(geojson.features.length);
}

main();
