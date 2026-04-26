<script lang="ts">
	import type { Abschnitt } from "../types";

	let { selectedSection = null }: { selectedSection: Abschnitt | null } = $props();

	let hasPrioTwo = $state(false)
	let hasPrioThree = $state(false)

	$effect(() => {
    	hasPrioTwo = selectedSection?.prioritaet.prioritaet_2 !== undefined
    	hasPrioThree = selectedSection?.prioritaet.prioritaet_3 !== undefined
	})
</script>

<section class="editor">
	{#if selectedSection}
		<header>
			<div class="content">
				<div class="title">
					<h2>{selectedSection.straße}</h2>
					<span class="identifier">{selectedSection.bereich} - {selectedSection.abschnittsnummer}</span>
				</div>
				<p>{selectedSection.abschnitt}</p>
			</div>
		</header>

		<section>
			<h3>Priorität</h3>
			<div class="meters">
    			<meter min="0" max="10" value={hasPrioTwo || hasPrioThree ? 10 : selectedSection.prioritaet.prioritaet_1}></meter>
    			<meter min="0" max="10" value={hasPrioThree ? 10 : selectedSection.prioritaet.prioritaet_2}></meter>
    			<meter min="0" max="10" value={selectedSection.prioritaet.prioritaet_3}></meter>
			</div>
		</section>

		<section>
			<h3>Maßnahmen</h3>
			<p>{selectedSection.maßnahmen}</p>
		</section>

		<section>
			<h3>Kommentar</h3>
			<p>{selectedSection.kommentar}</p>
		</section>

		<details>
			<summary>Aktuelle Kfz-Situation</summary>
			{#if selectedSection.kfzVerkehr}
				<p>Zulässige Höchstgeschwindigkeit: {selectedSection.kfzVerkehr.zulässigeHöchstgeschwindigkeit}</p>
				<p>Kfz Spitzenstunde: {selectedSection.kfzVerkehr.summeKfzSpitzenstunde}</p>
			{/if}
		</details>

		<details>
			<summary>Aktuelle Radverkehr-Situation</summary>
			<p>Führungsform: {selectedSection.führungsform}</p>
			<p>Verkehrssicherheit: {selectedSection.verkehrssicherheit}</p>
		</details>
	{:else}
		<header>
			<div class="placeholder">
				<p>Klicken Sie auf eine Route, um Details anzuzeigen</p>
			</div>
		</header>
	{/if}
</section>

<style>

	section.editor {
		display: flex;
		gap: 2rem;
		flex-direction: column;
		align-items: start;
		padding: 0 1rem;
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

			.placeholder {
				text-align: center;
				color: #666;
				width: 100%;
				padding: 2rem 0;
			}
		}

		section {
			display: flex;
			flex-direction: column;
			gap: 0.5rem;
			align-items: start;
			width: 100%;

			h3 {
				font-family: var(--font-serif);
				font-size: 1.25rem;
				font-style: italic;
				font-weight: 500;
			}

			p {
				text-wrap: balance;
			}

			.meters {
    			display: flex;
    			gap: 6px;
    			width: 100%;
    			border-radius: 3px;
    			overflow: hidden;

    			meter {
     			width: 100%;
     			height: 6px;
     			border: none;
     			background: #D9D9D9;
     			appearance: none;

     			&::-webkit-meter-progress {
        				background: #898989;
     			}

     			&::-moz-meter-bar {
        				background: #898989;
     			}
      		}
    		}
		}



		details {
			summary {
				font-family: var(--font-serif);
				font-size: 1.25rem;
				font-style: italic;
				font-weight: 500;
				opacity: 0.5;
				cursor: pointer;

				&:active,
				&:focus {
					outline: 2px dashed black;
					outline-offset: 2px;
				}

				details[open] & {
					opacity: 1;
				}
			}

			p {
				padding: 0.5rem 0;
				font-size: 0.9rem;
			}
		}
	}
</style>
