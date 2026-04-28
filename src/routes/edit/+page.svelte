<script lang="ts">
	import * as turf from "@turf/turf";
	import type {
		Feature,
		FeatureCollection,
		LineString,
		Position,
	} from "geojson";
	import { GeoJSON, LineLayer, MapLibre, SymbolLayer } from "svelte-maplibre";
	import zielnetz from "../../radverkehrskonzept_zielnetz.geojson?url";

	type EditMode = "splitting" | "editing";

	let mapRef: maplibregl.Map | undefined = $state(undefined);
	let geojsonData = $state<FeatureCollection | null>(null);
	let selectedFeatureIndex = $state<number | null>(null);
	let selectedFeature = $state<Record<string, unknown> | null>(null);
	let editMode = $state<EditMode>("splitting");
	let editingId = $state<string>("");
	let idInputRef: HTMLInputElement | null = $state(null);

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
			// In editing mode, sync the id field
			if (editMode === "editing" && selectedFeature) {
				editingId = (selectedFeature.id as string) ?? "";
			}
		} else {
			selectedFeature = null;
			editingId = "";
		}
	});

	// Auto-focus the ID input when in editing mode with a feature selected
	$effect(() => {
		if (editMode === "editing" && selectedFeature && idInputRef) {
			idInputRef.focus();
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
		clickPoint: Position,
	): [Position[], Position[]] {
		const clickAsPoint = turf.point(clickPoint);

		// Find which vertex is actually closest to the click point
		let closestIndex = 0;
		let closestDist = Infinity;

		for (let i = 0; i < coords.length; i++) {
			const dist = turf.distance(clickAsPoint, coords[i], {
				units: "meters",
			});
			if (dist < closestDist) {
				closestDist = dist;
				closestIndex = i;
			}
		}

		// Clamp to valid range
		const splitIndex = Math.max(
			0,
			Math.min(coords.length - 1, closestIndex),
		);

		// Both segments include the split vertex so they connect perfectly
		const beforeCoords = coords.slice(0, splitIndex + 1);
		const afterCoords = coords.slice(splitIndex);

		return [beforeCoords, afterCoords];
	}

	function handleClick(e: maplibregl.MapMouseEvent) {
		if (!mapRef || !geojsonData) return;

		const features = mapRef.queryRenderedFeatures(e.point);
		const targetFeature = features.find((f) => f.layer.id === "zielnetz");

		if (!targetFeature) return;

		const clickedIndex = targetFeature.id as number;
		const originalFeature = geojsonData.features[clickedIndex];

		if (!originalFeature) {
			console.log("Feature not found at index", clickedIndex);
			return;
		}

		if (editMode === "editing") {
			// In editing mode, just select the feature
			selectedFeature = originalFeature.properties ?? null;
			selectedFeatureIndex = clickedIndex;
			return;
		}

		// Path Splitting mode
		// Check if it's a LineString or MultiLineString
		if (
			originalFeature.geometry.type !== "LineString" &&
			originalFeature.geometry.type !== "MultiLineString"
		) {
			console.log(
				"Only LineString and MultiLineString features can be split",
			);
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

		const distToStart = turf.distance(clickPoint, start, {
			units: "meters",
		});
		const distToEnd = turf.distance(clickPoint, end, { units: "meters" });

		if (distToStart < 5 || distToEnd < 5) {
			console.log("Click too close to endpoint, showing details only");
			selectedFeature = originalFeature.properties ?? null;
			selectedFeatureIndex = clickedIndex;
			return;
		}

		// Split the line
		const [beforeCoords, afterCoords] = splitLineAtPoint(
			coords,
			clickPoint,
		);
		const properties = { ...originalFeature.properties };
		const color = randomColor();

		// Create two new features
		const feature1: Feature<LineString> = {
			type: "Feature",
			geometry: { type: "LineString", coordinates: beforeCoords },
			properties: { ...properties },
		};

		const feature2: Feature<LineString> = {
			type: "Feature",
			geometry: { type: "LineString", coordinates: afterCoords },
			properties: { ...properties, color },
		};

		// Replace the original feature with the two new ones
		const updatedFeatures = [...geojsonData.features];
		updatedFeatures.splice(clickedIndex, 1, feature1, feature2);

		geojsonData = {
			...geojsonData,
			features: updatedFeatures,
		};

		// Select the new (second) feature
		selectedFeature = feature2.properties;
		selectedFeatureIndex = clickedIndex + 1;
	}

	function updateFeatureId() {
		if (selectedFeatureIndex === null || !geojsonData) return;

		const updatedFeatures = [...geojsonData.features];
		const feature = updatedFeatures[selectedFeatureIndex];
		if (feature?.properties) {
			feature.properties.id = editingId;
			geojsonData = {
				...geojsonData,
				features: updatedFeatures,
			};
		}
	}

	function saveToFile() {
		if (!geojsonData) return;

		const blob = new Blob([JSON.stringify(geojsonData, null, 2)], {
			type: "application/geo+json",
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
	<div class="mode-selector">
		<label for="mode-select">Edit Mode:</label>
		<select id="mode-select" bind:value={editMode}>
			<option value="splitting">Path Splitting</option>
			<option value="editing">Information Editing</option>
		</select>
	</div>

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
							"line-opacity": 1,
						}}
						interactive
					/>
					<SymbolLayer
						id="zielnetz-labels"
						filter={["has", "id"]}
						layout={{
							"text-field": ["get", "id"],
							"text-font": [
								"Open Sans Bold",
								"Arial Unicode MS Bold",
							],
							"text-size": 12,
							"text-anchor": "center",
							"symbol-placement": "line-center",
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

	<aside class="sidebar">
		{#if selectedFeature}
			<button
				class="close-btn"
				onclick={() => (selectedFeatureIndex = null)}
				type="button">Close</button
			>
			<div class="details">
				{#if selectedFeature.id}
					<span class="id-pill">{selectedFeature.id}</span>
				{/if}
				<h2>Route Details</h2>
				{#if editMode === "editing"}
					<div class="property id-edit">
						<label for="id-input">ID:</label>
						<input
							type="text"
							id="id-input"
							bind:this={idInputRef}
							bind:value={editingId}
							onchange={updateFeatureId}
						/>
					</div>
				{/if}
				{#each Object.entries(selectedFeature) as [key, value]}
					{#if key !== "id" || editMode !== "editing"}
						<div class="property">
							<span class="key">{key}:</span>
							<span class="value">{value}</span>
						</div>
					{/if}
				{/each}
			</div>
		{:else}
			<div class="placeholder">
				<p>Tap a route on the map to see details</p>
				<p class="hint">
					{#if editMode === "splitting"}
						Click on a route to split it
					{:else}
						Click on a route to edit its information
					{/if}
				</p>
			</div>
		{/if}
		<button class="save-btn" onclick={saveToFile} type="button"
			>Save to File</button
		>
	</aside>
</div>

<style>
	.container {
		display: flex;
		height: 100vh;
		flex-direction: column;
	}

	.mode-selector {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background: #333;
		color: white;
	}

	.mode-selector label {
		font-size: 0.9rem;
	}

	.mode-selector select {
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		border: none;
		background: #555;
		color: white;
		cursor: pointer;
	}

	.mode-selector select:hover {
		background: #666;
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

	.property.id-edit {
		padding: 0.5rem;
		background: #e8f5e9;
		border-radius: 4px;
		border: none;
		margin-bottom: 0.5rem;
	}

	.id-pill {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		background: #1976d2;
		color: white;
		border-radius: 16px;
		font-size: 0.85rem;
		font-weight: 500;
		margin-bottom: 0.5rem;
	}

	.property.id-edit label {
		font-weight: 600;
		min-width: 30px;
	}

	.property.id-edit input {
		flex: 1;
		padding: 0.25rem 0.5rem;
		border: 1px solid #ccc;
		border-radius: 4px;
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
