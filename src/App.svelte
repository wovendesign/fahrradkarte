<script lang="ts">
	import { LineLayer, GeoJSON, MapLibre } from "svelte-maplibre";
	import zielnetz from "./radverkehrskonzept_zielnetz.geojson?url";
	import * as turf from "@turf/turf";
	import type { Feature, LineString, FeatureCollection, Position } from "geojson";

	let mapRef: maplibregl.Map | null = $state(null);
	let geojsonData = $state<FeatureCollection | null>(null);
	let selectedFeatureIndex = $state<number | null>(null);
	let selectedFeature = $state<Record<string, unknown> | null>(null);

	// Load GeoJSON data
	$effect(() => {
		fetch(zielnetz)
			.then((res) => res.json())
			.then((data: FeatureCollection) => {
				geojsonData = data;
			});
	});

	// Update selection when selectedFeatureIndex changes
	$effect(() => {
		if (selectedFeatureIndex !== null && geojsonData) {
			const feature = geojsonData.features[selectedFeatureIndex];
			selectedFeature = feature?.properties ?? null;
		} else {
			selectedFeature = null;
		}
	});

	// Generate a random color
	function randomColor(): string {
		const hue = Math.floor(Math.random() * 360);
		return `hsl(${hue}, 70%, 50%)`;
	}

// Split line at a given point
	function splitLineAtPoint(
		coords: Position[],
		clickPoint: Position
	): [Position[], Position[]] {
		const line = turf.lineString(coords);
		const nearestPoint = turf.nearestPointOnLine(line, turf.point(clickPoint));
		const clickAsPoint = turf.point(clickPoint);

		// Find which vertex is actually closest to the click point
		let closestIndex = 0;
		let closestDist = Infinity;

		for (let i = 0; i < coords.length; i++) {
			const dist = turf.distance(clickAsPoint, coords[i], { units: "meters" });
			if (dist < closestDist) {
				closestDist = dist;
				closestIndex = i;
			}
		}

		// Clamp to valid range
		const splitIndex = Math.max(0, Math.min(coords.length - 1, closestIndex));

		// Both segments include the split vertex so they connect perfectly
		// Segment 1: start → split vertex (inclusive)
		// Segment 2: split vertex (inclusive) → end
		const beforeCoords = coords.slice(0, splitIndex + 1);
		const afterCoords = coords.slice(splitIndex);

		return [beforeCoords, afterCoords];
	}

	function handleClick(e: maplibregl.MapMouseEvent) {
		if (!mapRef || !geojsonData) return;

		const features = mapRef.queryRenderedFeatures(e.point);
		const targetFeature = features.find((f) => f.layer.id === "zielnetz");

		if (!targetFeature) return;

		// Use MapLibre's generated ID (which is the feature index when generateId is used)
		const clickedIndex = targetFeature.id as number;
		const originalFeature = geojsonData.features[clickedIndex];

		if (!originalFeature) {
			console.log("Feature not found at index", clickedIndex);
			return;
		}

		// Check if it's a LineString or MultiLineString
		if (
			originalFeature.geometry.type !== "LineString" &&
			originalFeature.geometry.type !== "MultiLineString"
		) {
			console.log("Only LineString and MultiLineString features can be split");
			selectedFeature = originalFeature.properties ?? null;
			selectedFeatureIndex = clickedIndex;
			return;
		}

		const clickPoint: Position = [e.lngLat.lng, e.lngLat.lat];
		const coords =
			originalFeature.geometry.type === "MultiLineString"
				? originalFeature.geometry.coordinates[0]
				: originalFeature.geometry.coordinates;

		// Check if clicked point is too close to endpoints (within 5 meters)
		const start = turf.point(coords[0] as Position);
		const end = turf.point(coords[coords.length - 1] as Position);

		const distToStart = turf.distance(clickPoint, start, { units: "meters" });
		const distToEnd = turf.distance(clickPoint, end, { units: "meters" });

		if (distToStart < 5 || distToEnd < 5) {
			console.log("Click too close to endpoint, showing details only");
			selectedFeature = originalFeature.properties ?? null;
			selectedFeatureIndex = clickedIndex;
			return;
		}

		// Split the line
		const [beforeCoords, afterCoords] = splitLineAtPoint(coords, clickPoint);
		const properties = { ...originalFeature.properties };
		const color = randomColor();

		// Create two new features
		const feature1: Feature<LineString> = {
			type: "Feature",
			geometry: { type: "LineString", coordinates: beforeCoords },
			properties: { ...properties }
		};

		const feature2: Feature<LineString> = {
			type: "Feature",
			geometry: { type: "LineString", coordinates: afterCoords },
			properties: { ...properties, color }
		};

		// Replace the original feature with the two new ones
		const updatedFeatures = [...geojsonData.features];
		updatedFeatures.splice(clickedIndex, 1, feature1, feature2);

		geojsonData = {
			...geojsonData,
			features: updatedFeatures
		};

		// Select the new (second) feature
		selectedFeature = feature2.properties;
		selectedFeatureIndex = clickedIndex + 1;
	}

	function saveToFile() {
		if (!geojsonData) return;

		const blob = new Blob([JSON.stringify(geojsonData, null, 2)], {
			type: "application/geo+json"
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "radverkehrskonzept_zielnetz_split.geojson";
		a.click();
		URL.revokeObjectURL(url);
	}
</script>

<div class="container">
	<div class="map-wrapper">
		<MapLibre
			bind:map={mapRef}
			center={[13.08, 52.415]}
			zoom={12}
			class="map"
			standardControls
			style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
			onclick={handleClick}
		>
			{#if geojsonData}
				<GeoJSON id="routes" data={geojsonData} generateId>
					<LineLayer
						id="zielnetz"
						layout={{ "line-cap": "round", "line-join": "round" }}
						paint={{
							"line-width": 6,
							"line-color": ["get", "color"],
							"line-opacity": 1
						}}
						interactive
					/>
				</GeoJSON>
			{/if}
		</MapLibre>
	</div>

	<aside class="sidebar">
		{#if selectedFeature}
			<button class="close-btn" onclick={() => (selectedFeatureIndex = null)} type="button">Close</button>
			<div class="details">
				<h2>Route Details</h2>
				{#each Object.entries(selectedFeature) as [key, value]}
					<div class="property">
						<span class="key">{key}:</span>
						<span class="value">{value}</span>
					</div>
				{/each}
			</div>
		{:else}
			<div class="placeholder">
				<p>Tap a route on the map to see details</p>
				<p class="hint">Click on a route to split it</p>
			</div>
		{/if}
		<button class="save-btn" onclick={saveToFile} type="button">Save to File</button>
	</aside>
</div>

<style>
	.container {
		display: flex;
		height: 100vh;
		flex-direction: column;
	}

	.map-wrapper {
		flex: 1;
		min-height: 0;
	}

	:global(.map) {
		height: 100%;
		width: 100%;
	}

	.sidebar {
		padding: 1rem;
		background: #f5f5f5;
		border-top: 1px solid #ddd;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.sidebar h2 {
		margin: 0;
		font-size: 1.1rem;
	}

	.property {
		display: flex;
		gap: 0.5rem;
		padding: 0.25rem 0;
		border-bottom: 1px solid #eee;
		font-size: 0.9rem;
	}

	.key {
		font-weight: 600;
		color: #666;
	}

	.value {
		color: #333;
	}

	.close-btn {
		align-self: flex-end;
		padding: 0.25rem 0.75rem;
		background: #333;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	.close-btn:hover {
		background: #555;
	}

	.save-btn {
		padding: 0.5rem 1rem;
		background: #2e7d32;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.9rem;
	}

	.save-btn:hover {
		background: #1b5e20;
	}

	.placeholder {
		text-align: center;
		color: #666;
	}

	.hint {
		font-size: 0.85rem;
		color: #999;
		margin-top: 0.5rem;
	}

	.details {
		max-height: 300px;
		overflow-y: auto;
	}
</style>