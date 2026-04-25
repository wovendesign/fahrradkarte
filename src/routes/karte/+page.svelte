<main>

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
    section.editor {
        /* Sidebar if less width than 40vw*/
        display: flex;
        gap: 2rem;
        flex-direction: column;
        align-items: start;

        /* WIP */
        max-width: 40vw;

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

                details[open] & {
                    opacity: 1;
                }
            }
        }
    }
</style>
