<script lang="ts">
	import { allComments } from "$lib/stores/comments";

	let copiedState = $state<Record<string, "route" | "comment">>({});
	let copiedTimer = $state<Record<string, ReturnType<typeof setTimeout>>>({});

	function handleCopy(id: string, type: "route" | "comment") {
		clearTimeout(copiedTimer[id]);
		copiedState = { ...copiedState, [id]: type };
		copiedTimer[id] = setTimeout(() => {
			const { [id]: _, ...rest } = copiedState;
			copiedState = rest;
		}, 2000);
	}

	let commentEntries = $derived(
		Object.entries($allComments).filter(
			([, value]) => value && value.trim(),
		),
	);

	async function writeClipboardText(
		text: string,
		id: string,
		type: "route" | "comment",
	) {
		try {
			await navigator.clipboard.writeText(text);
			handleCopy(id, type);
		} catch (error) {
			console.error(error);
		}
	}

	function generateCsv(): string {
		const header = "Abschnitt;Anmerkung\n";
		const rows = commentEntries
			.map(([routeId, value]) => {
				const escaped = value.replace(/"/g, '""');
				return `"${routeId}";"${escaped}"`;
			})
			.join("\n");
		return header + rows;
	}

	function generateText(): string {
		return commentEntries
			.map(([routeId, value]) => `${routeId}: ${value}`)
			.join("\n\n");
	}

	function downloadFile(format: "csv" | "text") {
		const content = format === "csv" ? generateCsv() : generateText();
		const mimeType = format === "csv" ? "text/csv" : "text/plain";
		const extension = format === "csv" ? "csv" : "txt";

		const blob = new Blob([content], { type: mimeType });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `anmerkungen.${extension}`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}
</script>

<svelte:head>
	<title>Anmerkungen · Besser Radeln: Potsdams Radverkehrkonzept kommentieren</title>
	<meta
		name="description"
		content="Die Stadt möchte Feedback für das neu veröffentlichte Radverkehrskonzept. Auf unserer interaktiven Karte kannst du deine Anmerkungen einbringen"
	/>

	<!-- Facebook Meta Tags -->
	<meta property="og:url" content="https://potsdam.transparenz.cool/" />
	<meta property="og:type" content="website" />
	<meta
		property="og:title"
		content="Anmerkungen · Besser Radeln: Potsdams Radverkehrkonzept kommentieren"
	/>
	<meta
		property="og:description"
		content="Die Stadt möchte Feedback für das neu veröffentlichte Radverkehrskonzept. Auf unserer interaktiven Karte kannst du deine Anmerkungen einbringen"
	/>
	<meta property="og:image" content="/og-image.png" />

	<!-- Twitter Meta Tags -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta property="twitter:domain" content="potsdam.transparenz.cool" />
	<meta property="twitter:url" content="https://potsdam.transparenz.cool/" />
	<meta
		name="twitter:title"
		content="Anmerkungen · Besser Radeln: Potsdams Radverkehrkonzept kommentieren"
	/>
	<meta
		name="twitter:description"
		content="Die Stadt möchte Feedback für das neu veröffentlichte Radverkehrskonzept. Auf unserer interaktiven Karte kannst du deine Anmerkungen einbringen"
	/>
	<meta name="twitter:image" content="/og-image.png" />
</svelte:head>

<main>
	<a href="/" class="button">← Zurück zur Karte</a>
	<h1>Deine Anmerkungen</h1>
	<p>
		Die Stadt Potsdam stellt ein Rückmeldeformular zur Verfügung, in dem die Bereichs- und Abschnittsnummer, sowie die persönliche Anmerkung zum jeweiligen Routenabschnitt mitgeteilt werden muss.
	</p>
	<a
		href="https://mitgestalten.potsdam.de/de/besserradeln/massnahmenrvk2035"
		target="_blank"
		>zum Rückmeldeformular der Stadt Potsdam <svg
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<title>In neuem Tab öffnen</title>
			<path
				d="M21 9.75C21 9.94891 20.921 10.1397 20.7803 10.2803C20.6397 10.421 20.4489 10.5 20.25 10.5C20.0511 10.5 19.8603 10.421 19.7197 10.2803C19.579 10.1397 19.5 9.94891 19.5 9.75V5.56125L13.2816 11.7806C13.1408 11.9214 12.95 12.0004 12.7509 12.0004C12.5519 12.0004 12.361 11.9214 12.2203 11.7806C12.0796 11.6399 12.0005 11.449 12.0005 11.25C12.0005 11.051 12.0796 10.8601 12.2203 10.7194L18.4387 4.5H14.25C14.0511 4.5 13.8603 4.42098 13.7197 4.28033C13.579 4.13968 13.5 3.94891 13.5 3.75C13.5 3.55109 13.579 3.36032 13.7197 3.21967C13.8603 3.07902 14.0511 3 14.25 3H20.25C20.4489 3 20.6397 3.07902 20.7803 3.21967C20.921 3.36032 21 3.55109 21 3.75V9.75ZM17.25 12C17.0511 12 16.8603 12.079 16.7197 12.2197C16.579 12.3603 16.5 12.5511 16.5 12.75V19.5H4.5V7.5H11.25C11.4489 7.5 11.6397 7.42098 11.7803 7.28033C11.921 7.13968 12 6.94891 12 6.75C12 6.55109 11.921 6.36032 11.7803 6.21967C11.6397 6.07902 11.4489 6 11.25 6H4.5C4.10218 6 3.72064 6.15804 3.43934 6.43934C3.15804 6.72064 3 7.10218 3 7.5V19.5C3 19.8978 3.15804 20.2794 3.43934 20.5607C3.72064 20.842 4.10218 21 4.5 21H16.5C16.8978 21 17.2794 20.842 17.5607 20.5607C17.842 20.2794 18 19.8978 18 19.5V12.75C18 12.5511 17.921 12.3603 17.7803 12.2197C17.6397 12.079 17.4489 12 17.25 12Z"
				fill="currentColor"
			/>
		</svg>
	</a>
	<details>
		<summary>Anleitung</summary>
		<p>Jeder Eintrag kann einzeln kopiert werden, um diesen 1:1 in das Rückmeldeformular der Stadt einzufügen.
Im Rückmeldeformular muss zunächst die Bereichs- und Abschnittsnummer eingetragen werden. Nach Klick auf den Button »Weiter« erscheint ein Feld, in welches jetzt die Anmerkung eingefügt werden kann. Erst mit Klick auf »Hinweis senden« wird die Anmerkung an die Stadt übermittelt.
Für das eigene Archiv können die Anmerkungen als CSV-Datei (Tabelle) oder Textdatei heruntergeladen werden.</p>
	</details>

	{#if commentEntries.length === 0}
		<p class="empty">
			Du hast noch keine Anmerkungen geschrieben. Gehe dafür <a href="/"
				>zurück zur Karte.</a
			>
		</p>
	{:else}
		<table>
			<thead>
				<tr>
					<th scope="col">Bereich und Routenabschnitt</th>
					<th scope="col">Anmerkung</th>
				</tr>
			</thead>
			<tbody>
				{#each commentEntries as [routeId, value]}
					<tr class="comment">
						<th scope="row">
							<div class="flex">
								{routeId}
								<button
									class="copy-btn"
									class:copied={copiedState[
										`${routeId}-route`
									] === "route"}
									aria-label="Inhalt kopieren"
									type="button"
									onclick={() =>
										writeClipboardText(
											routeId,
											`${routeId}-route`,
											"route",
										)}
								>
									{#if copiedState[`${routeId}-route`] === "route"}
										<svg
											width="18"
											height="18"
											viewBox="0 0 18 18"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<title>Kopiert</title>
											<path
												d="M15.75 5.25L7.125 13.875L3.375 10.125"
												stroke="black"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round"
											/>
										</svg>

										<span>Kopiert!</span>
									{:else}
										<svg
											width="18"
											height="18"
											viewBox="0 0 18 18"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<title>Kopieren</title>
											<path
												d="M17.25 0H5.25C5.05109 0 4.86032 0.0790178 4.71967 0.21967C4.57902 0.360322 4.5 0.551088 4.5 0.75V4.5H0.75C0.551088 4.5 0.360322 4.57902 0.21967 4.71967C0.0790178 4.86032 0 5.05109 0 5.25V17.25C0 17.4489 0.0790178 17.6397 0.21967 17.7803C0.360322 17.921 0.551088 18 0.75 18H12.75C12.9489 18 13.1397 17.921 13.2803 17.7803C13.421 17.6397 13.5 17.4489 13.5 17.25V13.5H17.25C17.4489 13.5 17.6397 13.421 17.7803 13.2803C17.921 13.1397 18 12.9489 18 12.75V0.75C18 0.551088 17.921 0.360322 17.7803 0.21967C17.6397 0.0790178 17.4489 0 17.25 0ZM12 16.5H1.5V6H12V16.5ZM16.5 12H13.5V5.25C13.5 5.05109 13.421 4.86032 13.2803 4.71967C13.1397 4.57902 12.9489 4.5 12.75 4.5H6V1.5H16.5V12Z"
												fill="black"
											/>
										</svg>

										<span>Abschnittsnummer kopieren</span>
									{/if}
								</button>
							</div>
						</th>

						<td class="comment-text">
							<div class="flex">
								{value}
								<button
									class="copy-btn"
									class:copied={copiedState[
										`${routeId}-comment`
									] === "comment"}
									aria-label="Inhalt kopieren"
									type="button"
									onclick={() =>
										writeClipboardText(
											value,
											`${routeId}-comment`,
											"comment",
										)}
								>
									{#if copiedState[`${routeId}-comment`] === "comment"}
										<svg
											width="18"
											height="18"
											viewBox="0 0 18 18"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<title>Kopiert</title>
											<path
												d="M15.75 5.25L7.125 13.875L3.375 10.125"
												stroke="black"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round"
											/>
										</svg>

										<span>Kopiert!</span>
									{:else}
										<svg
											width="18"
											height="18"
											viewBox="0 0 18 18"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<title>Kopieren</title>
											<path
												d="M17.25 0H5.25C5.05109 0 4.86032 0.0790178 4.71967 0.21967C4.57902 0.360322 4.5 0.551088 4.5 0.75V4.5H0.75C0.551088 4.5 0.360322 4.57902 0.21967 4.71967C0.0790178 4.86032 0 5.05109 0 5.25V17.25C0 17.4489 0.0790178 17.6397 0.21967 17.7803C0.360322 17.921 0.551088 18 0.75 18H12.75C12.9489 18 13.1397 17.921 13.2803 17.7803C13.421 17.6397 13.5 17.4489 13.5 17.25V13.5H17.25C17.4489 13.5 17.6397 13.421 17.7803 13.2803C17.921 13.1397 18 12.9489 18 12.75V0.75C18 0.551088 17.921 0.360322 17.7803 0.21967C17.6397 0.0790178 17.4489 0 17.25 0ZM12 16.5H1.5V6H12V16.5ZM16.5 12H13.5V5.25C13.5 5.05109 13.421 4.86032 13.2803 4.71967C13.1397 4.57902 12.9489 4.5 12.75 4.5H6V1.5H16.5V12Z"
												fill="black"
											/>
										</svg>

										<span>Anmerkung kopieren</span>
									{/if}
								</button>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
		<div class="downloads">
			<button
				class="download-btn"
				type="button"
				onclick={() => downloadFile("csv")}
			>
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<title>Herunterladen</title>
					<path
						d="M20.0306 7.71938L14.7806 2.46938C14.7109 2.39975 14.6282 2.34454 14.5371 2.3069C14.4461 2.26926 14.3485 2.24992 14.25 2.25H5.25C4.85218 2.25 4.47064 2.40804 4.18934 2.68934C3.90804 2.97064 3.75 3.35218 3.75 3.75V20.25C3.75 20.6478 3.90804 21.0294 4.18934 21.3107C4.47064 21.592 4.85218 21.75 5.25 21.75H18.75C19.1478 21.75 19.5294 21.592 19.8107 21.3107C20.092 21.0294 20.25 20.6478 20.25 20.25V8.25C20.2501 8.15148 20.2307 8.05391 20.1931 7.96286C20.1555 7.87182 20.1003 7.78908 20.0306 7.71938ZM15 4.81031L17.6897 7.5H15V4.81031ZM18.75 20.25H5.25V3.75H13.5V8.25C13.5 8.44891 13.579 8.63968 13.7197 8.78033C13.8603 8.92098 14.0511 9 14.25 9H18.75V20.25ZM14.7806 14.4694C14.8504 14.539 14.9057 14.6217 14.9434 14.7128C14.9812 14.8038 15.0006 14.9014 15.0006 15C15.0006 15.0986 14.9812 15.1962 14.9434 15.2872C14.9057 15.3783 14.8504 15.461 14.7806 15.5306L12.5306 17.7806C12.461 17.8504 12.3783 17.9057 12.2872 17.9434C12.1962 17.9812 12.0986 18.0006 12 18.0006C11.9014 18.0006 11.8038 17.9812 11.7128 17.9434C11.6217 17.9057 11.539 17.8504 11.4694 17.7806L9.21937 15.5306C9.07864 15.3899 8.99958 15.199 8.99958 15C8.99958 14.801 9.07864 14.6101 9.21937 14.4694C9.36011 14.3286 9.55098 14.2496 9.75 14.2496C9.94902 14.2496 10.1399 14.3286 10.2806 14.4694L11.25 15.4397V11.25C11.25 11.0511 11.329 10.8603 11.4697 10.7197C11.6103 10.579 11.8011 10.5 12 10.5C12.1989 10.5 12.3897 10.579 12.5303 10.7197C12.671 10.8603 12.75 11.0511 12.75 11.25V15.4397L13.7194 14.4694C13.789 14.3996 13.8717 14.3443 13.9628 14.3066C14.0538 14.2688 14.1514 14.2494 14.25 14.2494C14.3486 14.2494 14.4462 14.2688 14.5372 14.3066C14.6283 14.3443 14.711 14.3996 14.7806 14.4694Z"
						fill="black"
					/>
				</svg>

				<span>als CSV-Datei herunterladen</span>
			</button>
			<button
				class="download-btn"
				type="button"
				onclick={() => downloadFile("text")}
			>
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<title>Herunterladen</title>
					<path
						d="M20.0306 7.71938L14.7806 2.46938C14.7109 2.39975 14.6282 2.34454 14.5371 2.3069C14.4461 2.26926 14.3485 2.24992 14.25 2.25H5.25C4.85218 2.25 4.47064 2.40804 4.18934 2.68934C3.90804 2.97064 3.75 3.35218 3.75 3.75V20.25C3.75 20.6478 3.90804 21.0294 4.18934 21.3107C4.47064 21.592 4.85218 21.75 5.25 21.75H18.75C19.1478 21.75 19.5294 21.592 19.8107 21.3107C20.092 21.0294 20.25 20.6478 20.25 20.25V8.25C20.2501 8.15148 20.2307 8.05391 20.1931 7.96286C20.1555 7.87182 20.1003 7.78908 20.0306 7.71938ZM15 4.81031L17.6897 7.5H15V4.81031ZM18.75 20.25H5.25V3.75H13.5V8.25C13.5 8.44891 13.579 8.63968 13.7197 8.78033C13.8603 8.92098 14.0511 9 14.25 9H18.75V20.25ZM14.7806 14.4694C14.8504 14.539 14.9057 14.6217 14.9434 14.7128C14.9812 14.8038 15.0006 14.9014 15.0006 15C15.0006 15.0986 14.9812 15.1962 14.9434 15.2872C14.9057 15.3783 14.8504 15.461 14.7806 15.5306L12.5306 17.7806C12.461 17.8504 12.3783 17.9057 12.2872 17.9434C12.1962 17.9812 12.0986 18.0006 12 18.0006C11.9014 18.0006 11.8038 17.9812 11.7128 17.9434C11.6217 17.9057 11.539 17.8504 11.4694 17.7806L9.21937 15.5306C9.07864 15.3899 8.99958 15.199 8.99958 15C8.99958 14.801 9.07864 14.6101 9.21937 14.4694C9.36011 14.3286 9.55098 14.2496 9.75 14.2496C9.94902 14.2496 10.1399 14.3286 10.2806 14.4694L11.25 15.4397V11.25C11.25 11.0511 11.329 10.8603 11.4697 10.7197C11.6103 10.579 11.8011 10.5 12 10.5C12.1989 10.5 12.3897 10.579 12.5303 10.7197C12.671 10.8603 12.75 11.0511 12.75 11.25V15.4397L13.7194 14.4694C13.789 14.3996 13.8717 14.3443 13.9628 14.3066C14.0538 14.2688 14.1514 14.2494 14.25 14.2494C14.3486 14.2494 14.4462 14.2688 14.5372 14.3066C14.6283 14.3443 14.711 14.3996 14.7806 14.4694Z"
						fill="black"
					/>
				</svg>
				<span>als Text-Datei herunterladen</span>
			</button>
		</div>
	{/if}
</main>

<style>
	main {
		padding: 2rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		max-width: 75rem;

		> p {
			max-width: 65ch;
			text-wrap: balance;
		}

		a:not(.button) {
			color: #20f;
			text-decoration: underline;

			> svg {
				height: 1rem;
			}
		}

		details {
			summary {
				font-family: var(--font-serif);
				font-size: 1.25rem;
				font-style: italic;
				font-weight: 500;
				cursor: pointer;
				width: fit-content;

				&:active,
				&:focus {
					outline: 2px dashed black;
					outline-offset: 2px;
				}
			}
		}

		.empty {
			color: rgba(0, 0, 0, 0.5);
			margin-top: 2rem;

			a {
				color: inherit;
			}
		}

		table {
			width: 100%;
			border-collapse: collapse;
			margin-top: 1rem;
			thead {
				tr {
					background: #f4f4f4;
					border-bottom: 1px solid rgba(0, 0, 0, 0.2);
				}

				th {
					font-family: var(--font-serif);
					font-size: 1.125rem;
					font-weight: 700;
					padding: 0.375rem;
					text-align: left;

					&:first-child {
						width: 25rem;
					}
				}

				@media screen and (max-width: 640px) {
					display: none;
				}
			}

			tbody {
				@media screen and (max-width: 640px) {
					display: flex;
					flex-direction: column;
					gap: 1rem;
				}

				tr {
					border-bottom: 1px solid rgba(0, 0, 0, 0.04);
					@media screen and (max-width: 640px) {
						display: flex;
						flex-direction: column;
						gap: 0;
						border-left: 2px solid rgba(0, 0, 0, 0.3);
						border-bottom: 0;
					}

					&:nth-child(odd) {
						background: rgba(0, 0, 0, 0.02);
					}

					&:nth-child(even) {
						background: rgba(0, 0, 0, 0.04);
					}

					th,
					td {
						padding: 0.375rem;
						vertical-align: top;
						text-align: left;
						@media screen and (max-width: 640px) {
							padding: 0.25rem 1rem;
						}

						.flex {
							display: flex;
							gap: 0.5rem;
							width: 100%;
							justify-content: space-between;

							@media screen and (max-width: 640px) {
								flex-direction: column;
								align-items: start;
							}
						}
					}

					th:first-child .flex {
						font-family: var(--font-serif);
						font-size: 1.125rem;
						font-weight: 400;
					}
				}

				.comment-text {
					font-family: var(--font-sans);
					font-size: 1.125rem;
					line-height: 1.5;
					flex: 1;
				}
			}
		}

		.copy-btn,
		.download-btn {
			display: flex;
			align-items: center;
			gap: 0.625rem;
			padding: 0.375rem;
			background: rgba(0, 0, 0, 0.1);
			border: none;
			border-radius: 0.125rem;
			cursor: pointer;
			min-width: max;
			font-family: var(--font-sans);
			font-size: 1.125rem;
			color: black;
			transition:
				background 0.2s ease-out,
				transform 0.1s ease-out;

			svg {
				width: 1.125rem;
				height: 1.125rem;
			}

			&:hover {
				background: rgba(0, 0, 0, 0.15);
			}

			&:active {
				transform: scale(0.96);
			}

			&.copied {
				background: rgba(34, 139, 34, 0.15);
				transition: transform 0.15s ease-out;
				transform: scale(1.05);

				&:not(:active) {
					transform: scale(1);
				}
			}
		}

		.downloads {
			display: flex;
			gap: 0.5rem;
			margin-top: 1rem;
			flex-wrap: wrap;
		}
	}
</style>
