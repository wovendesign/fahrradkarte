<script>
	let { showModal = $bindable(), children } = $props();

	let dialog = $state(); // HTMLDialogElement
	let pageWrapper = $state(); // HTMLElement
	let currentIndex = $state(0);

	$effect(() => {
		if (showModal) {
			currentIndex = 0;
			dialog?.showModal();
		}
	});

	function getChildCount() {
		return pageWrapper?.children?.length ?? 0;
	}

	function updateCurrentIndex() {
		const children = pageWrapper?.children;
		if (!children?.length) return;
		const wrapperRect = pageWrapper.getBoundingClientRect();
		currentIndex = [...children].findIndex((child) => {
			const rect = child.getBoundingClientRect();
			return rect.left >= wrapperRect.left;
		});
	}

	function scrollToNextSection() {
		const children = pageWrapper?.children;
		if (!children?.length) return;
		const next = children[currentIndex + 1];
		if (next) next.scrollIntoView({ behavior: "smooth", inline: "start" });
	}

	function scrollToPrevSection() {
		const children = pageWrapper?.children;
		if (!children?.length) return;
		const prev = children[currentIndex - 1];
		if (prev) prev.scrollIntoView({ behavior: "smooth", inline: "start" });
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog
	bind:this={dialog}
	onclose={() => (showModal = false)}
	onclick={(e) => {
		if (e.target === dialog) dialog.close();
	}}
	onscroll={updateCurrentIndex}
>
	<div>
		<div class="page-wrapper" bind:this={pageWrapper} onscroll={updateCurrentIndex}>
			{@render children?.()}
		</div>
		<div class="button-row">
			{#if currentIndex > 0}
				<button onclick={scrollToPrevSection} class="button" type="button">previous</button>
			{/if}
			{#if currentIndex < getChildCount() - 1}
				<button onclick={scrollToNextSection} class="button" type="button">next</button>
				<button onclick={() => dialog.close()} class="skip" type="button">skip</button>
			{:else}
				<button
					autofocus
					onclick={() => dialog.close()}
					class="button"
					type="button">close modal</button
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
</style>
