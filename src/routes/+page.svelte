<script lang="ts">
	import type { FeatureCollection } from "geojson";
	import { BottomSheet } from "svelte-bottom-sheet";
	import {
		combineFilters,
		GeoJSON,
		LineLayer,
		type LngLatBoundsLike,
		type LngLatLike,
		MapEvents,
		MapLibre,
		SymbolLayer,
		AttributionControl,
	} from "svelte-maplibre";
	import Sidebar from "$lib/Sidebar.svelte";
	import data from "../data.json?url";
	import zielnetz from "../radverkehrskonzept_zielnetz.geojson?url";
	import type { Abschnitt } from "../types";
	import Modal from "$lib/Modal.svelte";
	import { onMount } from "svelte";

	let showModal = $state(false);

	let mapRef: maplibregl.Map | null = $state(null);
	let geojsonData = $state<FeatureCollection | null>(null);
	let sectionMap = $state<Map<string, Abschnitt> | null>(null);
	let selectedSection = $state<Abschnitt | null>(null);
	let sheetOpen = $state(false);
	let isMobile = $state(false);

	function checkMobile() {
		isMobile = window.innerWidth <= 640;
	}

	$effect(() => {
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	});

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

	$effect(() => {
		if (selectedSection && isMobile) {
			sheetOpen = true;
		}
	});

	const bounds: LngLatBoundsLike = [
		[12.9343, 52.3322],
		[13.2052, 52.4819],
	];

	const center: LngLatLike = [13.05768, 52.39968];

	function handleClick(e: maplibregl.MapMouseEvent) {
		console.log("click!", e.lngLat, "sectionMap:", !!sectionMap);
		if (!mapRef || !sectionMap) return;

		if (!mapRef.isStyleLoaded()) return;

		const features = mapRef.queryRenderedFeatures(e.point);
		console.log("features found:", features.length, "layers:", [
			...new Set(features.map((f) => f.layer.id)),
		]);

		const feature = features.find(
			(f) =>
				f.layer.id === "zielnetz-hitarea" ||
				f.layer.id.startsWith("zielnetz-in-map"),
		);
		if (!feature) return;

		const id = feature.properties?.id as string;
		console.log("id:", id);

		if (!id) return;

		const section =
			sectionMap.get(id) ?? sectionMap.get(id.replace("_", " "));
		console.log("section found:", !!section);
		if (section) {
			selectedSection = section;
		}
	}

	let isScrollable = $state(false);

	let validIds = $derived(
		sectionMap
			? [
					...Array.from(sectionMap.keys()),
					...Array.from(sectionMap.keys()).map((k) =>
						k.replace(" ", "_"),
					),
				]
			: [],
	);

	let plusrouteIds = $derived(
		sectionMap
			? Array.from(sectionMap.entries())
					.filter(([_, v]) => v.radnetzfunktion === "Plusroute")
					.flatMap(([k, _]) => [k, k.replace(" ", "_")])
			: [],
	);

	let hauptroute1Ids = $derived(
		sectionMap
			? Array.from(sectionMap.entries())
					.filter(
						([_, v]) => v.radnetzfunktion === "Hauptroute 1. Stufe",
					)
					.flatMap(([k, _]) => [k, k.replace(" ", "_")])
			: [],
	);

	let hauptroute2Ids = $derived(
		sectionMap
			? Array.from(sectionMap.entries())
					.filter(
						([_, v]) => v.radnetzfunktion === "Hauptroute 2. Stufe",
					)
					.flatMap(([k, _]) => [k, k.replace(" ", "_")])
			: [],
	);

	onMount(() => {
		if (!localStorage.getItem("modalDismissed")) {
			showModal = true;
		}
	});
</script>

<main>
	<Modal bind:showModal>
		<section>
			<h1>Radverkehrskonzept Potsdam</h1>
			<h2>von 2026 für 2035</h2>
			<p>
				Die Stadt Potsdam fragt nach Feedback zu ihrem neuen
				Radverkehrskonzept. Eine bürger·innennahe
				Radinfrastrukturplanung ist die Grundlage einer zukunftsfähigen
				Stadt. Deswegen stellen wir eine Übersichtskarte zur Verfügung
				mit der Anmerkungen für die Stadt Potsdam vorbereitet werden
				können.
			</p>
			<p class="disclaimer">
				(Visualisierung basierend auf öffentlich zugänglichen Daten der
				Stadt Potsdam. Keine offizielle Kooperation; reine visuelle
				Aufbereitung durch woven.design) Stand: 27.04.2026
			</p>
		</section>
		<section>Anleitung seite eins</section>
	</Modal>
	<div class="container">
		<div class="map-wrapper">
			<MapLibre
				bind:map={mapRef}
				zoom={14}
				class="map"
				standardControls
				maxBounds={bounds}
				{center}
				attributionControl={false}
				style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
			>
				<AttributionControl
					position="bottom-right"
					customAttribution={'<a href="/impressum">Impressum</a>'}
				/>
				<MapEvents onclick={handleClick} />
				{#if geojsonData}
					<GeoJSON id="routes" data={geojsonData} generateId>
						<LineLayer
							id="zielnetz-hitarea"
							filter={["has", "id"]}
							paint={{
								"line-width": 40,
								"line-color": "transparent",
								"line-opacity": 0,
							}}
							interactive
						/>
						{#if validIds.length > 0}
							<LineLayer
								id="zielnetz-in-map-plusroute"
								filter={[
									"in",
									["get", "id"],
									["literal", plusrouteIds],
								]}
								layout={{
									"line-cap": "round",
									"line-join": "round",
								}}
								paint={{
									"line-width": 6,
									"line-color": "#e63946",
									"line-opacity": 1,
								}}
								interactive
							/>
							<LineLayer
								id="zielnetz-in-map-hauptroute1"
								filter={[
									"in",
									["get", "id"],
									["literal", hauptroute1Ids],
								]}
								layout={{
									"line-cap": "round",
									"line-join": "round",
								}}
								paint={{
									"line-width": 6,
									"line-color": "#1d3557",
									"line-opacity": 1,
								}}
								interactive
							/>
							<LineLayer
								id="zielnetz-in-map-hauptroute2"
								filter={[
									"in",
									["get", "id"],
									["literal", hauptroute2Ids],
								]}
								layout={{
									"line-cap": "round",
									"line-join": "round",
								}}
								paint={{
									"line-width": 6,
									"line-color": "#457b9d",
									"line-opacity": 1,
								}}
								interactive
							/>
							<LineLayer
								id="zielnetz-in-map-other"
								filter={[
									"all",
									["has", "id"],
									[
										"!",
										[
											"in",
											["get", "id"],
											["literal", plusrouteIds],
										],
									],
									[
										"!",
										[
											"in",
											["get", "id"],
											["literal", hauptroute1Ids],
										],
									],
									[
										"!",
										[
											"in",
											["get", "id"],
											["literal", hauptroute2Ids],
										],
									],
									[
										"in",
										["get", "id"],
										["literal", validIds],
									],
								]}
								layout={{
									"line-cap": "round",
									"line-join": "round",
								}}
								paint={{
									"line-width": 6,
									"line-color": "#333",
									"line-opacity": 1,
								}}
								interactive
							/>
							<LineLayer
								id="zielnetz-not-in-map"
								filter={[
									"all",
									["has", "id"],
									[
										"!",
										[
											"in",
											["get", "id"],
											["literal", validIds],
										],
									],
								]}
								layout={{
									"line-cap": "round",
									"line-join": "round",
								}}
								paint={{
									"line-width": 6,
									"line-color": "#999",
									"line-opacity": 1,
									"line-dasharray": [2, 2],
								}}
								interactive
							/>
						{:else}
							<LineLayer
								id="zielnetz-not-in-map"
								filter={["has", "id"]}
								layout={{
									"line-cap": "round",
									"line-join": "round",
								}}
								paint={{
									"line-width": 6,
									"line-color": "#999",
									"line-opacity": 1,
									"line-dasharray": [2, 2],
								}}
								interactive
							/>
						{/if}
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
								"text-rotation-alignment": "viewport",
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
	</div>

	{#if isMobile}
		<BottomSheet
			bind:isSheetOpen={sheetOpen}
			settings={{
				maxHeight: 1,
				snapPoints: [0.5, 1],
				closeThreshold: 0.25,
				startingSnapPoint: 0.5,
			}}
			onclose={() => {
				sheetOpen = false;
				isScrollable = false;
			}}
			onsnap={(e) => (isScrollable = e === 1)}
		>
			<BottomSheet.Overlay>
				<BottomSheet.Sheet
					class={[isScrollable ? "isScrollable" : "notScrollable"]}
				>
					<BottomSheet.Handle>
						<div class="sheet-handle"></div>
					</BottomSheet.Handle>
					<BottomSheet.Content>
						<div class="sheet-content">
<Sidebar {selectedSection} onclose={() => selectedSection = null} />
						</div>
					</BottomSheet.Content>
				</BottomSheet.Sheet>
			</BottomSheet.Overlay>
		</BottomSheet>
	{:else if selectedSection}
		<Sidebar {selectedSection} onclose={() => selectedSection = null} />
	{/if}
</main>

<style>
	main {
		display: flex;
		width: 100%;

		@media screen and (max-width: 640px) {
			flex-direction: column;
			height: 100dvh;
		}
	}

	.container {
		display: flex;
		height: 100vh;
		flex-direction: column;
		flex: 1;

		@media screen and (max-width: 640px) {
			width: 100vw;
			height: 100%;
		}
	}

	.map-wrapper {
		flex: 1;
		min-height: 0;
		width: 100%;
		min-height: 300px;
	}

	:global(.map) {
		height: 100%;
		width: 100%;
	}

	.sheet-handle {
		width: 40px;
		height: 4px;
		background: #ccc;
		border-radius: 2px;
		margin: 8px auto;
	}

	.sheet-content {
		padding-bottom: 2rem;
	}

	:global {
		.notScrollable {
			overflow-y: hidden !important;
		}
	}
</style>
