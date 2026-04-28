async function main() {
	const geojson = await Bun.file(
		"src/radverkehrskonzept_zielnetz.geojson",
		"utf8",
	).json();

	geojson.features = geojson.features.filter(
		(path) => path.properties.id !== "x",
	);

	geojson.features = geojson.features.map((path) => {
		return {
			...path,
			properties: {
				id: path.properties.id ? String(path.properties.id) : undefined,
				straße: path.properties.name || path.properties.straße,
				abschnitt: path.properties.Zwischen || path.properties.abschnitt,
			},
		};
	});

	await Bun.write(
		"src/radverkehrskonzept_zielnetz.geojson",
		JSON.stringify(geojson, null, 2),
	);
}

main();
