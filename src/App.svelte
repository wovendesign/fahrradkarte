<script lang="ts">
import { LineLayer, GeoJSON, MapLibre } from "svelte-maplibre";
import zielnetz from "./radverkehrskonzept_zielnetz.geojson?url";

let selectedFeature = $state(null);
let mapRef: Map<any, any> | null = $state(null);

function handleClick(e: MouseEvent) {
	if (!mapRef) return;
	const features = mapRef.queryRenderedFeatures(e.point);
	console.log(features);
	if (features.length > 0 && features[0].layer.id === "zielnetz") {
		selectedFeature = features[0].properties;
	}
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
      <GeoJSON data={zielnetz} generateId>
        <LineLayer
          id="zielnetz"
          layout={{ 'line-cap': 'round', 'line-join': 'round' }}
          paint={{
            'line-width': 6,
            'line-color': ['get', 'color'],
            'line-opacity': 1,
          }}
          interactive
        />
      </GeoJSON>
    </MapLibre>
  </div>

  <aside class="sidebar">
    {#if selectedFeature}
      <button class="close-btn" onclick={() => selectedFeature = null} type="button">Close</button>
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
      </div>
    {/if}
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
</style>
