<script lang="ts">
	import { LineLayer, GeoJSON, MapLibre, SymbolLayer, MapEvents, type LngLatBoundsLike, type LngLatLike } from "svelte-maplibre";
	import zielnetz from "../../radverkehrskonzept_zielnetz.geojson?url";
	import data from "../../data.json?url";
	import type { FeatureCollection } from "geojson";
	import type { Abschnitt } from "../types";
	import Sidebar from "$lib/Sidebar.svelte";

	let mapRef: maplibregl.Map | null = $state(null);
	let geojsonData = $state<FeatureCollection | null>(null);
	let sectionMap = $state<Map<string, Abschnitt> | null>(null);
	let selectedSection = $state<Abschnitt | null>(null);

	$effect(() => {
		fetch(zielnetz)
			.then((res) => res.json())
			.then((data: FeatureCollection) => {
				geojsonData = data;
			});

		fetch(data)
			.then((res) => res.text())
			.then((str) => {
				const raw = JSON.parse(str);
				const entries = raw.value as [string, Abschnitt][];
				sectionMap = new Map(entries);
			})
			.catch(console.error);
	});

	const bounds: LngLatBoundsLike = [
        [12.9343, 52.3322],
        [13.2052, 52.4819]
    ];

	const center: LngLatLike = [13.05768, 52.39968]

	function handleClick(e: maplibregl.MapMouseEvent) {
		console.log("click!", e.lngLat, "sectionMap:", !!sectionMap);
		if (!mapRef || !sectionMap) return;

		if (!mapRef.isStyleLoaded()) return;

		const features = mapRef.queryRenderedFeatures(e.point);
		console.log("features found:", features.length, "layers:", [...new Set(features.map(f => f.layer.id))]);

		const feature = features.find((f) => f.layer.id === "zielnetz");
		if (!feature) return;

		const id = feature.properties?.id as string;
		console.log("id:", id);

		if (!id) return;

		const section = sectionMap.get(id) ?? sectionMap.get(id.replace("_", " "));
		console.log("section found:", !!section);
		if (section) {
			selectedSection = section;
		}
	}
</script>

<main>
	<div class="container">
		<div class="map-wrapper">
			<MapLibre
				bind:map={mapRef}
				zoom={14}
				class="map"
				standardControls
				maxBounds={bounds}
				center={center}
				style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
			>
				<MapEvents onclick={handleClick} />
				{#if geojsonData}
					<GeoJSON id="routes" data={geojsonData} generateId>
						<LineLayer
							id="zielnetz"
							filter={["has", "id"]}
							layout={{ "line-cap": "round", "line-join": "round" }}
							paint={{
								"line-width": 6,
								"line-color": "#333",
								"line-opacity": 1
							}}
							interactive
						/>
						<SymbolLayer
							id="zielnetz-labels"
							filter={["has", "id"]}
							layout={{
								"text-field": ["get", "id"],
								"text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
								"text-size": 12,
								"text-anchor": "center",
								"text-rotation-alignment": "viewport",
								"symbol-placement": "line-center"
							}}
							paint={{
								"text-color": "#ffffff",
								"text-halo-color": "#000000",
								"text-halo-width": 2,
							}}
						/>
					</GeoJSON>
				{/if}
			</MapLibre>
		</div>
	</div>

	<Sidebar selectedSection={selectedSection} />
</main>

<style>
	main {
		display: flex;

		@media screen and (max-width: 640px) {
			flex-direction: column;
		}
	}
	.container {
		display: flex;
		height: 100vh;
		flex-direction: column;
		width: 60vw;

		@media screen and (max-width: 640px) {
			width: 100vw;
			height: 60vh;
		}
	}

	.map-wrapper {
		flex: 1;
		min-height: 0;
	}

	:global(.map) {
		height: 100%;
		width: 100%;
	}
</style>
