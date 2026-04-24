<script>
  import MapLibre from 'svelte-maplibre/MapLibre.svelte';
  import GeoJSON from 'svelte-maplibre/GeoJSON.svelte';
  import LineLayer from 'svelte-maplibre/LineLayer.svelte';
  import zielnetz from './radverkehrskonzept_zielnetz.geojson?url';
</script>

<MapLibre
  center={[13.08, 52.415]}
  zoom={12}
  class="map"
  standardControls
  style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
>
  <GeoJSON data={zielnetz}>
    <LineLayer
      layout={{ 'line-cap': 'round', 'line-join': 'round' }}
      paint={{
        'line-width': 4,
        'line-color': '#0066cc',
      }}
    />
  </GeoJSON>
</MapLibre>

<style>
  :global(.map) {
    height: 100vh;
    width: 100%;
  }
</style>

