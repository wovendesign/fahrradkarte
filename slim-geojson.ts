async function main() {
	const geojson = await Bun.file(
		"src/radverkehrskonzept_zielnetz.geojson",
		"utf8",
	).json();

	geojson.features = geojson.features.map((path) => {
		return {
			...path,
			properties: {
				id: path.properties.id,
				straße: path.properties.name,
				abschnitt: path.properties.Zwischen,
			},
		};
	});

	await Bun.write(
		"src/radverkehrskonzept_zielnetz.geojson",
		JSON.stringify(geojson, null, 2),
	);
}

main();
