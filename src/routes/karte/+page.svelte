    <script lang="ts">
	import { LineLayer, GeoJSON, MapLibre, SymbolLayer } from "svelte-maplibre";
	import zielnetz from "../../radverkehrskonzept_zielnetz.geojson?url";
	import type { FeatureCollection } from "geojson";

	let geojsonData = $state<FeatureCollection | null>(null);

	$effect(() => {
		fetch(zielnetz)
			.then((res) => res.json())
			.then((data: FeatureCollection) => {
				geojsonData = data;
			});
	});
    </script>
<main>

    <div class="container">
	<div class="map-wrapper">
		<MapLibre
			center={[13.08, 52.415]}
			zoom={12}
			class="map"
			standardControls
			style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
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
					/>
					<SymbolLayer
						id="zielnetz-labels"
						filter={["has", "id"]}
						layout={{
							"text-field": ["get", "id"],
							"text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
							"text-size": 12,
							"text-anchor": "center",
							"symbol-placement": "line-center"
						}}
						paint={{
							"text-color": "#ffffff",
							"text-halo-color": "#000000",
							"text-halo-width": 2
						}}
					/>
				</GeoJSON>
			{/if}
		</MapLibre>
	</div>
    </div>

    <section class="editor">

        <header>
            <button type="button" class="button">← Zurück</button>
            <div class="content">
                <div class="title">
                    <!-- Straße -->
                    <h2>Gutenbergstraße</h2>
                    <!-- Bereich - Abschnittsnummer -->
                    <span class="identifier">M 1 - 4</span>
                </div>
                <!-- Abschnitt -->
                <p>zw. Hans-Thoma-Straße und Berliner Straße</p>
            </div>
        </header>

        <section>
            <h3>Priorität</h3>
        </section>

        <section>
            <h3>Maßnahmen</h3>
            <p>Bau eines Zweirichtungsradwegs auf der Südseite inklusive Überleitung in die Gutenbergstraße.</p>
        </section>

        <section>
            <h3>Kommentar</h3>
            <p>viele Geisterradler in Fahrtrichtung Innenstadt Für die Umsetzung ist Grunderwerb notwendig.</p>
        </section>

        <details>
            <summary>Aktuelle Kfz-Situation</summary>
        </details>

        <details>
            <summary>Aktuelle Radverkehr-Situation</summary>
        </details>

    </section>
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
    section.editor {
        /* Sidebar if less width than 40vw*/
        display: flex;
        gap: 2rem;
        flex-direction: column;
        align-items: start;
        padding: 0 1rem;

        /* WIP */
        max-width: 40vw;
        @media screen and (max-width: 640px) {
      		max-width: 100vw;
            padding-top: 1rem;
        }

        header {
            display: flex;
            gap: 0.5rem;
            flex-direction: column;
            align-items: start;
            width: 100%;

            .content {
                width: 100%;

                .title {
                    display: flex;
                    width: 100%;
                    justify-content: space-between;
                    align-items: center;

                    h2 {
                        font-family: var(--font-serif);
                        font-size: 2rem;
                    }
                    span {
                        font-family: var(--font-serif);
                        font-size: 1.125rem;
                    }
                }

                p {
                    font-family: var(--font-serif);
                    font-size: 1.25rem;
                    font-style: italic;
                }
            }

        }

        section {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            align-items: start;

            h3 {
                font-family: var(--font-serif);
                font-size: 1.25rem;
                font-style: italic;
                font-weight: 500;
            }

            p {
                text-wrap: balance;
            }
        }

        details {
            summary {
                font-family: var(--font-serif);
                font-size: 1.25rem;
                font-style: italic;
                font-weight: 500;
                opacity: 0.5;

                &:active, &:focus {
                    outline: 2px dashed black;
                    outline-offset: 2px;
                }

                details[open] & {
                    opacity: 1;
                }
            }
        }
    }
</style>
