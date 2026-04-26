import { JSDOM } from 'jsdom';

export interface Abschnitt {
    abschnittsnummer: string;
    straße?: string;
    abschnitt?: string;
    bereich?: string;
    lage?: string;
    radnetzfunktion?: string;
    längeInMeter?: number;
    führungsform?: string;
    bewertungFührungsform?: number;
    bewertungAnlagenzustand?: number;
    bewertungGesamt?: number;
    verkehrssicherheit?: string;
    maßnahmen?: string;
    kommentar?: string;
    prioritaet?: {
        radnetzfunktion?: number;
        bewertung_soll_ist?: number;
        radverkehrsmengen?: number;
        prioritaet_1?: number;
        prioritaet_2?: number;
        prioritaet_3?: number;
    };
    kfzVerkehr: {
        summeKfzSpitzenstunde?: number;
        kfzParkenAufstellform?: string;
        sicherheitsabstandParken?: string;
        zulässigeHöchstgeschwindigkeit?: string;
    };
}

async function main() {
    console.log('Reading HTML...');
    const html = await Bun.file('fahrradkarte.html', 'utf8').text();
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    const tables = doc.querySelectorAll('table[style*="border-collapse"]');
    const sections: Map<string, Abschnitt> = new Map;

    for (const table of tables) {
        // console.log("table")
        const abschnittsnummer = table.querySelector("tbody > tr:nth-child(2) > td:nth-child(2) > p:nth-child(2)")?.textContent.trim().replace(" ", "_")
        if (!abschnittsnummer) {
            console.log("No abschnittsnummer")
            continue
        }
        const verkehrssicherheit = table.querySelector("tbody > tr:nth-child(12) > td:nth-child(2) > p:nth-child(1)")?.textContent
        const maßnahmen = table.querySelector("tbody > tr:nth-child(13) > td:nth-child(3) > p:nth-child(1)")?.textContent
        const kommentar = table.querySelector("tbody > tr:nth-child(14) > td:nth-child(2)")?.textContent

        const isPrioOne = table.querySelector("tbody > tr:nth-child(15) > td:nth-child(2) > p:nth-child(2)")?.textContent === "Priorität I"
        const isPrioTwo = table.querySelector("tbody > tr:nth-child(15) > td:nth-child(2) > p:nth-child(2)")?.textContent === "Priorität II"
        const isPrioThree = table.querySelector("tbody > tr:nth-child(15) > td:nth-child(2) > p:nth-child(2)")?.textContent === "Priorität III"

        const abschnitt: Abschnitt = {
            abschnittsnummer,
            straße: table.querySelector("tbody > tr:nth-child(1) > td:nth-child(1) > p:nth-child(2)")?.textContent,
            abschnitt: table.querySelector("tbody > tr:nth-child(2) > td:nth-child(1)")?.textContent,
            bereich: table.querySelector("tbody > tr:nth-child(1) > td:nth-child(2)")?.textContent.replace("Bereich:", "").trim(),
            lage: table.querySelector("tbody > tr:nth-child(3) > td:nth-child(1) > p:nth-child(1)")?.textContent.replace("Lage: ", ""),
            längeInMeter: Number(table.querySelector("tbody > tr:nth-child(3) > td:nth-child(1) > p:nth-child(2)")?.textContent.replace("Länge in Meter: ", "")),
            radnetzfunktion: table.querySelector("tbody > tr:nth-child(3) > td:nth-child(1) > p:nth-child(1)")?.textContent.split("Radnetzfunktion: ")[1],
            führungsform: table.querySelector("tbody > tr:nth-child(8) > td:nth-child(3)")?.textContent,
            bewertungFührungsform: Number(table.querySelector("tbody > tr:nth-child(9) > td:nth-child(2)")?.textContent),
            bewertungAnlagenzustand: Number(table.querySelector("tbody > tr:nth-child(10) > td:nth-child(2)")?.textContent),
            bewertungGesamt: Number(table.querySelector("tbody > tr:nth-child(11) > td:nth-child(2)")?.textContent),
            verkehrssicherheit,
            maßnahmen: maßnahmen && maßnahmen.length > 0 ? maßnahmen : undefined,
            kommentar: kommentar && kommentar.length > 0 ? kommentar : undefined,
            prioritaet: {
                radnetzfunktion: Number(table.querySelector("tbody > tr:nth-child(15) > td:nth-child(3) > p:nth-child(1)")?.textContent.replace("Punkte", "")),
                bewertung_soll_ist: Number(table.querySelector("tbody > tr:nth-child(15) > td:nth-child(3) > p:nth-child(2)")?.textContent),
                radverkehrsmengen: Number(table.querySelector("tbody > tr:nth-child(15) > td:nth-child(3) > p:nth-child(4)")?.textContent),
                prioritaet_1: isPrioOne ? Number(table.querySelector("tbody > tr:nth-child(15) > td:nth-child(3) > p:nth-child(5)")?.textContent) : undefined,
                prioritaet_2: isPrioTwo ? Number(table.querySelector("tbody > tr:nth-child(15) > td:nth-child(3) > p:nth-child(5)")?.textContent) : undefined,
                prioritaet_3: isPrioThree ? Number(table.querySelector("tbody > tr:nth-child(15) > td:nth-child(3) > p:nth-child(5)")?.textContent) : undefined
            },
            kfzVerkehr: {
                zulässigeHöchstgeschwindigkeit: table.querySelector("tbody > tr:nth-child(7) > td:nth-child(2)")?.textContent,
                sicherheitsabstandParken: table.querySelector("tbody > tr:nth-child(6) > td:nth-child(2)")?.textContent,
                kfzParkenAufstellform: table.querySelector("tbody > tr:nth-child(5) > td:nth-child(2)")?.textContent,
                summeKfzSpitzenstunde: Number(table.querySelector("tbody > tr:nth-child(4) > td:nth-child(3)")?.textContent.replace(".", "")),
            }
        }


        sections.set(abschnitt.abschnittsnummer, abschnitt)
    }

    console.log(`Parsed ${sections.size} sections`);
    await Bun.write('src/data.json', JSON.stringify(sections, replacer, 2));
    console.log('Written to src/data.json');
}

main();

// Source - https://stackoverflow.com/a/56150320
// Posted by Pawel, modified by community. See post 'Timeline' for change history
// Retrieved 2026-04-24, License - CC BY-SA 4.0

function replacer(key, value) {
    if (value instanceof Map) {
        return {
            dataType: 'Map',
            value: Array.from(value.entries()), // or with spread: value: [...value]
        };
    } else {
        return value;
    }
}
