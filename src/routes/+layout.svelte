<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '@fontsource-variable/eb-garamond/wght.css';
	import '@fontsource-variable/eb-garamond/wght-italic.css';
	import '@fontsource-variable/ibm-plex-sans/wght.css';
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

<style>
    :global {
        @layer {
           	*,
           	*::before,
           	*::after {
          		box-sizing: border-box;
          		background-repeat: no-repeat;
           	}

           	* {
          		padding: 0;
          		margin: 0;
           	}

           	html {
          		-webkit-text-size-adjust: none;
          		text-size-adjust: none;
          		line-height: 1.5;
          		-webkit-font-smoothing: antialiased;
                            block-size: 100%;
           	}

           	body {
          		min-block-size: 100%;
           	}

           	img,
           	iframe,
           	audio,
           	video,
           	canvas {
          		display: block;
          		max-inline-size: 100%;
          		block-size: auto;
           	}

           	svg {
          		max-inline-size: 100%;
           	}

           	svg:not([fill]) {
          		fill: currentColor;
           	}

           	input,
           	button,
           	textarea,
           	select {
          		font: inherit;
           	}

           	textarea {
          		resize: vertical;
           	}

           	fieldset,
           	iframe {
          		border: none;
           	}

           	p,
           	h1,
           	h2,
           	h3,
           	h4,
           	h5,
           	h6 {
          		overflow-wrap: break-word;
           	}

           	p {
          		text-wrap: pretty;
          		font-variant-numeric: proportional-nums;
           	}

           	h1,
           	h2,
           	h3,
           	h4,
           	h5,
           	h6 {
          		font-variant-numeric: lining-nums;
           	}

           	p,
                        blockquote,
                        q,
                        figcaption,
                        li {
                            hanging-punctuation: first allow-end last;
                        }

           	input,
           	label,
           	button,
           	h1,
           	h2,
           	h3,
           	h4,
           	h5,
           	h6 {
                            line-height: 1.1;
                        }

           	math,
           	time,
           	table {
          		font-variant-numeric: tabular-nums lining-nums slashed-zero;
           	}

           	code {
          		font-variant-numeric: slashed-zero;
           	}

           	table {
          		border-collapse: collapse;
           	}

           	abbr {
          		font-variant-caps: all-small-caps;
          		text-decoration: none;

          		&[title] {
         			cursor: help;
         			text-decoration: underline dotted;
          		}
           	}

           	sup,
           	sub {
          		line-height: 0;
           	}

           	:disabled {
          		opacity: 0.8;
          		cursor: not-allowed;
           	}

           	:focus-visible {
          		outline-offset: 0.2rem;
           	}
        }

    }

    :root {
        --font-serif: 'EB Garamond Variable', serif;
        --font-sans-serif: 'IBM Plex Sans Variable', sans-serif;
    }

    :global(h1) {
        font-size: 4rem;
        font-family: var(--font-serif);
        font-style: italic;
        text-wrap: balance;
    }

    :global(*) {
        font-family: var(--font-sans-serif);
    }

    :global(.button) {
        --button-color: #000;
        background: var(--button-color);
        color: white;
        font-size: 1.5rem;
        text-decoration: none;
        font-family: var(--font-serif);
        font-style: normal;
        font-weight: 500;
        padding: 0.25rem 1rem;
        transition: .1s ease-out translate, .1s ease-out background;

        &:hover {
            background: color-mix(in oklch, var(--button-color) 70%, white 30%);
            translate: 0 -1px;
        }

        &:focus, &:active {
            outline: 2px dashed var(--button-color);
            outline-offset: 2px;
        }
    }
</style>
