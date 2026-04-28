<script lang="ts">
	import type { Abschnitt } from "../types";
	import Input from "./Input.svelte";
	import { allComments } from "$lib/stores/comments";
	import { get } from "svelte/store";

	let {
		selectedSection = null,
		isGeojsonOnly = false,
		onclose = () => {},
	}: {
		selectedSection: Abschnitt | null;
		isGeojsonOnly?: boolean;
		onclose: () => void;
	} = $props();

	let hasPrioTwo = $state(false);
	let hasPrioThree = $state(false);

	$effect(() => {
		hasPrioTwo = selectedSection?.prioritaet.prioritaet_2 !== undefined;
		hasPrioThree = selectedSection?.prioritaet.prioritaet_3 !== undefined;
	});

	function onCommentChange(routeId: string, value: string) {
		const comments = get(allComments) as Record<string, string>;
		comments[routeId] = value;
		allComments.set(comments);
	}
</script>

<section class="editor">
	{#if selectedSection}
		<button class="button close" onclick={onclose} type="button"
			>Schließen</button
		>
		<header>
			<div class="content">
				<div class="title">
					<h2>{selectedSection.straße || "Unbetitelte Straße"}</h2>
					<span class="identifier"
						>{selectedSection.bereich
							? `${selectedSection.bereich} - `
							: ""}{selectedSection.abschnittsnummer}</span
					>
				</div>
				{#if selectedSection.abschnitt}
					<p>{selectedSection.abschnitt}</p>
				{/if}
			</div>
		</header>

		{#if isGeojsonOnly}
			<section class="empty-state">
				<p class="empty-message">
					Die Stadt hat für diese Route keine Maßnahmen vorgesehen.
					Hast du trotzdem Anmerkungen?
				</p>
			</section>
		{:else}
			<section>
				<h3>Priorität</h3>
				<div class="meters">
					<meter
						min="0"
						max="10"
						value={hasPrioTwo || hasPrioThree
							? 10
							: selectedSection.prioritaet.prioritaet_1}
					></meter>
					<meter
						min="0"
						max="10"
						value={hasPrioThree
							? 10
							: selectedSection.prioritaet.prioritaet_2}
					></meter>
					<meter
						min="0"
						max="10"
						value={selectedSection.prioritaet.prioritaet_3}
					></meter>
				</div>
			</section>

			{#if selectedSection.maßnahmen}
				<section>
					<h3>Maßnahmen</h3>
					<p>{selectedSection.maßnahmen}</p>
				</section>
			{/if}

			{#if selectedSection.kommentar}
				<section>
					<h3>Kommentar</h3>
					<p>{selectedSection.kommentar}</p>
				</section>
			{/if}

			{#if selectedSection.kfzVerkehr}
				<details>
					<summary>Aktuelle Kfz-Situation</summary>
					<p>
						Zulässige Höchstgeschwindigkeit: {selectedSection
							.kfzVerkehr.zulässigeHöchstgeschwindigkeit}
					</p>
					<p>
						Kfz Spitzenstunde: {selectedSection.kfzVerkehr
							.summeKfzSpitzenstunde}
					</p>
				</details>
			{/if}

			<details>
				<summary>Aktuelle Radverkehr-Situation</summary>
				<p>Führungsform: {selectedSection.führungsform}</p>
				<p>Verkehrssicherheit: {selectedSection.verkehrssicherheit}</p>
			</details>
		{/if}

		<Input
			routeId={selectedSection?.abschnittsnummer}
			comment={allComments}
			onchange={onCommentChange}
		/>
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
		width: 40vw;
		min-width: 300px;
		max-width: 500px;
		padding-top: 1rem;

		@media screen and (max-width: 640px) {
			width: 100%;
			max-width: 100%;
			padding-top: 0rem;

			.close {
				display: none;
			}
		}

		header {
			display: flex;
			gap: 0.5rem;
			flex-direction: column;
			align-items: start;
			width: 100%;
			position: relative;

			.content {
				width: 100%;

				.title {
					display: flex;
					width: 100%;
					justify-content: space-between;
					align-items: start;

					@media screen and (max-width: 600px) {
						align-items: start;
						flex-direction: column-reverse;
					}

					h2 {
						font-family: var(--font-serif);
						font-size: 2rem;
					}
					span {
						font-family: var(--font-serif);
						font-size: 1.125rem;
						min-width: max-content;
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
					background: #d9d9d9;
					appearance: none;
					-webkit-appearance: none;

					&::-webkit-meter-bar {
						height: 6px;
						background: #d9d9d9;
						border: none;
					}

					&::-webkit-meter-optimum-value,
					&::-webkit-meter-suboptimum-value,
					&::-webkit-meter-even-less-good-value,
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
				width: fit-content;

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

		.empty-state {
			background: #f9f9f9;
			border-radius: 8px;
			padding: 1.5rem;
			text-align: center;

			.empty-message {
				font-family: var(--font-serif);
				font-size: 1.1rem;
				font-style: italic;
				color: #555;
				line-height: 1.6;
				margin: 0;
			}
		}
	}
</style>
