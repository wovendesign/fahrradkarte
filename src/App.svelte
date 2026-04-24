<script>
import MapLibre from "svelte-maplibre/MapLibre.svelte";
import GeoJSON from "svelte-maplibre/GeoJSON.svelte";
import LineLayer from "svelte-maplibre/LineLayer.svelte";
import zielnetz from "./radverkehrskonzept_zielnetz.geojson?url";

let selectedFeature = $state(null);
let mapRef = $state(null);

function handleClick(e) {
	if (!mapRef) return;
	const features = mapRef.queryRenderedFeatures(e.point);
	if (features.length > 0) {
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
          id="visible-layer"
          layout={{ 'line-cap': 'round', 'line-join': 'round' }}
          paint={{
            'line-width': 6,
            'line-color': '#0066cc',
            'line-opacity': 0.8,
          }}
        />
        <LineLayer
          id="hit-area"
          layout={{ 'line-cap': 'round', 'line-join': 'round' }}
          paint={{
            'line-width': 20,
            'line-color': '#ff0000',
            'line-opacity': 0,
          }}
        />
      </GeoJSON>
    </MapLibre>
  </div>

  <aside class="sidebar">
    {#if selectedFeature}
      <button class="close-btn" onclick={() => selectedFeature = null}>×</button>
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
