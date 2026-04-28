<script lang="ts">
	let { showModal = $bindable(), children } = $props();

	let dialog = $state<HTMLDialogElement | undefined>(); // HTMLDialogElement
	let pageWrapper = $state<HTMLDivElement | undefined>(); // HTMLDivElement
	let currentIndex = $state(0);

	function getChildCount() {
		return pageWrapper?.children?.length ?? 0;
	}

	function updateCurrentIndex() {
		if (!pageWrapper) return;
		const count = getChildCount();
		if (count === 0) return;
		currentIndex = Math.round(pageWrapper.scrollLeft / (pageWrapper.scrollWidth / count));
	}

	function scrollToNextSection() {
		if (!pageWrapper) return;
		const count = getChildCount();
		if (count === 0) return;
		const currentImage = Math.round(pageWrapper.scrollLeft / (pageWrapper.scrollWidth / count));
		if (currentImage === count - 1) {
			dialog?.close();
			return;
		}
		pageWrapper.scrollBy({ left: pageWrapper.clientWidth, behavior: "smooth" });
	}

	function scrollToPrevSection() {
		if (!pageWrapper) return;
		const count = getChildCount();
		if (count === 0) return;
		const currentImage = Math.round(pageWrapper.scrollLeft / (pageWrapper.scrollWidth / count));
		if (currentImage === 0) {
			pageWrapper.scrollTo({ left: pageWrapper.scrollWidth, behavior: "smooth" });
			return;
		}
		pageWrapper.scrollBy({ left: -pageWrapper.clientWidth, behavior: "smooth" });
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === "ArrowLeft") {
			scrollToPrevSection();
		} else if (e.key === "ArrowRight") {
			scrollToNextSection();
		}
	}

	$effect(() => {
		if (showModal) {
			currentIndex = 0;
			dialog?.showModal();
		}
	});
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog
	bind:this={dialog}
	onclose={() => {
		showModal = false;
		localStorage.setItem("modalDismissed", "true");
	}}
	onclick={(e) => {
		if (e.target === dialog) dialog.close();
	}}
>
	<div>
		<div
			class="page-wrapper"
			bind:this={pageWrapper}
			onscroll={updateCurrentIndex}
			onkeydown={handleKeydown}
			role="region"
		>
			{@render children?.()}
		</div>
		<div class="button-row">
			{#if currentIndex > 0}
				<button onclick={scrollToPrevSection} class="button" type="button">Zurück</button>
			{/if}
			{#if currentIndex < getChildCount() - 1}
				<button onclick={() => dialog?.close()} class="skip" type="button">Überspringen</button>
				<button onclick={scrollToNextSection} class="button" type="button">Weiter</button>
			{:else}
				<button
					onclick={() => dialog?.close()}
					class="button"
					type="button">Zur Karte</button
				>
			{/if}
		</div>
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
	.button-row {
		display: flex;
		gap: 0.5em;
		justify-content: flex-end;
		margin-top: 1rem;
	}
	.skip {
		display: block;
		background: none;
		border: none;
		padding: 0;
		font-size: 0.75em;
		color: #999;
		text-decoration: underline;
		cursor: pointer;
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

	:global {
	    section {
					display: flex;
					flex-direction: column;
					gap: 1rem;

					p.disclaimer {
					font-size: 0.75rem;
					opacity: 0.8;
					}
					}
	}
</style>
