<script lang="ts">
	import type { Writable } from 'svelte/store';
	import { get } from 'svelte/store';

	let {
	    bereichId,
		routeId = "",
		comment,
		onchange,
	}: {
	bereichId?: string
		routeId?: string;
		comment: Writable<Record<string, string>>;
		onchange: (routeId: string, value: string, bereichId?: string) => void;
	} = $props();

	let currentValue = $state("");

	$effect(() => {
		if (routeId) {
			const comments = get(comment) as Record<string, string>;
			currentValue = comments[routeId] ? JSON.parse(comments[routeId]).value : "";
		}
	});
</script>

<section>
	<h3>Deine Anmerkung</h3>
	{#if routeId}
		<textarea
			value={currentValue}
			oninput={(e) => {
				const target = e.target as HTMLTextAreaElement;
				currentValue = target.value;
				onchange(routeId, target.value, bereichId);
			}}
		></textarea>
	{:else}
		<p>Wähle einen Abschnitt aus</p>
	{/if}
	<p class="disclaimer">Dies ist nur deine Anmerkung. Niemand sonst sieht sie. Gespeichert ist sie ausschließlich auf deinem Gerät</p>
</section>

<style>
	section {
		display: flex;
		width: 100%;
		flex-direction: column;
		gap: 0.5rem;

		textarea {
			background: rgba(0, 0, 0, 0.05);
			border: none;
			min-height: 3rem;
			max-height: 12rem;
			width: 100%;
			border-radius: 2px;
			padding: 0.25rem 0.5rem;

			&:focus {
				outline-offset: 4px;
				outline: 2px solid black;
			}
		}
	}
</style>
