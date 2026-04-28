<script>
	let { showModal = $bindable(), children } = $props();

	let dialog = $state(); // HTMLDialogElement

	$effect(() => {
		if (showModal) dialog.showModal();
	});
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog
	bind:this={dialog}
	onclose={() => (showModal = false)}
	onclick={(e) => {
		if (e.target === dialog) dialog.close();
	}}
>
	<div>
		<div class="page-wrapper">
			{@render children?.()}
		</div>
		<!-- svelte-ignore a11y_autofocus -->
		<button
			autofocus
			onclick={() => dialog.close()}
			class="button"
			type="button">close modal</button
		>
	</div>
</dialog>

<style>
	dialog {
		--modal-width: min(80vw, 32em);
		width: var(--modal-width);
		border-radius: 0.2em;
		border: none;
		padding: 0;
		margin: auto auto;
	}
	dialog::backdrop {
		background: rgba(0, 0, 0, 0.3);
	}
	dialog > div {
		padding: 1em;
	}
	dialog[open] {
		animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	@keyframes zoom {
		from {
			transform: scale(0.95);
		}
		to {
			transform: scale(1);
		}
	}
	dialog[open]::backdrop {
		animation: fade 0.2s ease-out;
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	button {
		display: block;
	}

	.page-wrapper {
		display: flex;
		overflow-x: scroll;
		scroll-snap-type: x mandatory;

		:global {
			& > * {
			    --child-width: calc(var(--modal-width) - 2rem);
				height: 100%;
				width: var(--child-width);
				min-width: var(--child-width);
				max-width: var(--child-width);
				scroll-snap-align: center;
			}
		}
	}
</style>
