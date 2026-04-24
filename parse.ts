interface Abschnitt {
    abschnittsnummer: string;
    straße: string | null;
    abschnitt: string | null;
    bereich: string | null;
    lage: string | null;
    radnetzfunktion: string | null;
    längeInMeter: number | null;
    führungsform: string | null;
    bewertungFührungsform: number | null;
    bewertungAnlagenzustand: number | null;
    bewertungGesamt: number | null;
    verkehrssicherheit: string | null;
    maßnahmen: string | null;
    kommentar: string | null;
    prioritaet: {
        radnetzfunktion: number | null;
        bewertung_soll_ist: number | null;
        radverkehrsmengen: number | null;
        prioritaet_1: number | null;
        prioritaet_2: number | null;
    } | null;
    kfzVerkehr: {
        summeKfzSpitzenstunde: number | null;
        kfzParkenAufstellform: string | null;
        sicherheitsabstandParken: number | null;
        zulässigeHöchstgeschwindigkeit: string | null;
    };
    punkte: number | null;
}

function decodeText(text: string): string {
    if (!text) return '';
    let decoded = text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/<span[^>]*>/g, '')
        .replace(/<\/span>/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    // Decode HTML entities first
    decoded = decoded
        .replace(/\u00FC/g, 'ü')
        .replace(/\u00F6/g, 'ö')
        .replace(/\u00E4/g, 'ä')
        .replace(/\u00DC/g, 'Ü')
        .replace(/\u00D6/g, 'Ö')
        .replace(/\u00C4/g, 'Ä')
        .replace(/\u00DF/g, 'ß');

    // Only decode ASCII replacements if the text contains lowercase letters
    // ASCII encoding: ü→B, ö→3, ä→4
    // But "Be" at end of word = ß (straße), not ü
    if (/[a-z]/.test(decoded)) {
        // Handle "Be" at end of words = ß (ße)
        decoded = decoded.replace(/Be\b/gi, 'ße');
        // 3 surrounded by letters = ö
        decoded = decoded.replace(/([a-zäöü])3(?![0-9])/gi, '$1ö');
        decoded = decoded.replace(/3([a-zäöü])/gi, 'ö$1');
        // 4 surrounded by letters = ä
        decoded = decoded.replace(/([a-zäöü])4(?![0-9])/gi, '$1ä');
        decoded = decoded.replace(/4([a-zäöü])/gi, 'ä$1');
        // B standalone (not Be) = ü
        decoded = decoded.replace(/B(?![eE])/gi, 'ü');
    }

    return decoded;
}

function cleanText(text: string): string {
    if (!text) return '';
    return decodeText(text.replace(/<[^>]*>/g, '').trim());
}

function getTextContent(html: string): string {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractValueByLabel(html: string, label: string): string | null {
    const pattern = new RegExp(`${label}[\\s\\S]*?<p[^>]*>([\\s\\S]*?)<\\/p>`, 'i');
    const match = html.match(pattern);
    return match ? cleanText(match[1]) : null;
}

function extractNumberByLabel(html: string, label: string): number | null {
    const pattern = new RegExp(`${label}[\\s\\S]*?<p[^>]*>\\s*(\\d+)\\s*<\\/p>`, 'i');
    const match = html.match(pattern);
    return match ? parseInt(match[1]) : null;
}

async function main() {
    console.log('Reading HTML file...');
    const html = await Bun.file('fahrradkarte.html', 'utf8').text();

    console.log('Parsing sections...');
    const sections: Record<string, Abschnitt> = {};

    const tableRegex = /<table style="border-collapse:collapse;margin-left:6\.25pt"[^>]*>[\s\S]*?<\/table>/g;
    let tableMatch;
    let parsed = 0;

    function cleanTableHtml(html: string): string {
        return html
            .replace(/<span[^>]*>/g, '')
            .replace(/<\/span>/g, '');
    }

    while ((tableMatch = tableRegex.exec(html)) !== null) {
        const table = tableMatch[0];
        const tableClean = cleanTableHtml(table);

        const section: Partial<Abschnitt> = {
            kfzVerkehr: {
                summeKfzSpitzenstunde: null,
                kfzParkenAufstellform: null,
                sicherheitsabstandParken: null,
                zulässigeHöchstgeschwindigkeit: null,
            },
        };

        const abschnittsnummerMatch = table.match(/Abschnittsnummer:<\/p><p[^>]*>\s*([^<]+)\s*<\/p>/);
        if (!abschnittsnummerMatch) continue;
        section.abschnittsnummer = cleanText(abschnittsnummerMatch[1]).replace(/\s+/g, '');

        const straßeMatch = table.match(/padding-left:\s*5pt[^>]*>([^<]+)<\/p>/);
        if (straßeMatch) {
            const straße = cleanText(straßeMatch[1]);
            if (straße && !straße.includes('Abschnittsnummer')) {
                section.straße = straße;
            }
        }

        const bereichMatch = tableClean.match(/Bereich:\s*([^<]+)</);
        if (bereichMatch) {
            section.bereich = cleanText(bereichMatch[1]);
        }

        const abschnittMatch = tableClean.match(/height:43pt[^>]*>[^<]*<p[^>]*>([^<]+)<\/p>/);
        if (abschnittMatch) {
            section.abschnitt = cleanText(abschnittMatch[1]);
        }

        const lageRadnetzMatch = tableClean.match(/Lage:\s*([^<]+)Radnetzfunktion:\s*([^<]+)Lange/);
        if (lageRadnetzMatch) {
            section.lage = cleanText(lageRadnetzMatch[1]);
            section.radnetzfunktion = cleanText(lageRadnetzMatch[2]);
        }

        const längeMatch = tableClean.match(/Lange\s*in\s*Meter:\s*(\d+)/);
        if (längeMatch) {
            section.längeInMeter = parseInt(längeMatch[1]);
        }

        const kfzSection = table.match(/Bestand\s*Kfz-Verkehr[\s\S]*?<\/tr>/);
        if (kfzSection) {
            const kfzHtml = kfzSection[0];
            section.kfzVerkehr!.summeKfzSpitzenstunde = extractNumberByLabel(kfzHtml, 'Summe\\s*Kfz');
            section.kfzVerkehr!.kfzParkenAufstellform = extractValueByLabel(kfzHtml, 'Kfz-Parken');
            section.kfzVerkehr!.zulässigeHöchstgeschwindigkeit = extractValueByLabel(kfzHtml, 'Zulassige');

            const sicherMatch = kfzHtml.match(/Sicherheitsabstand[^>]*>\s*(\d+(?:,\d+)?)/);
            if (sicherMatch) {
                const num = parseFloat(sicherMatch[1].replace(',', '.'));
                if (!isNaN(num)) section.kfzVerkehr!.sicherheitsabstandParken = num;
            }
        }

        const radSection = table.match(/Bestand\s*Radverkehr[\s\S]*?<\/tr>/s);
        if (radSection) {
            const radHtml = radSection[0];
            section.führungsform = extractValueByLabel(radHtml, 'Fuhrungsform');
            section.bewertungFührungsform = extractNumberByLabel(radHtml, 'Bewertung.*Fuhrungsform');
            section.bewertungAnlagenzustand = extractNumberByLabel(radHtml, 'Bewertung.*Anlagenzustands');
            section.bewertungGesamt = extractNumberByLabel(radHtml, 'Gesamtbewertung');
            section.verkehrssicherheit = extractValueByLabel(radHtml, 'Verkehrssicherheit');
        }

        const empfehlungenSection = table.match(/Empfehlungen[\s\S]*?<\/table>/s);
        if (empfehlungenSection) {
            const empHtml = empfehlungenSection[0];
            section.maßnahmen = extractValueByLabel(empHtml, 'MaBnahmen');
            section.kommentar = extractValueByLabel(empHtml, 'Kommentar');

            const prioritaetMatch = empHtml.match(/Prioritat\s*11?\s*<\/p>[\s\S]*?(?:Punkte[\s\S]*?>)(\d+)[\s\S]*?>(\d+)[\s\S]*?<br[\s\S]*?>[\s\S]*?>(\d+)[\s\S]*?>(?:(\d+))?/);

            const punkteMatch = empHtml.match(/text-align:\s*center[^>]*>\s*(\d+)<\/p>/g);
            if (punkteMatch && punkteMatch.length >= 4) {
                section.prioritaet = {
                    radnetzfunktion: parseInt(punkteMatch[0].match(/\d+/)?.[0] || '0'),
                    bewertung_soll_ist: parseInt(punkteMatch[1].match(/\d+/)?.[0] || '0'),
                    radverkehrsmengen: parseInt(punkteMatch[2].match(/\d+/)?.[0] || '0'),
                    prioritaet_1: parseInt(punkteMatch[3].match(/\d+/)?.[0] || '0'),
                    prioritaet_2: punkteMatch[4] ? parseInt(punkteMatch[4].match(/\d+/)?.[0] || '0') : null,
                };
            }
        }

        if (section.abschnittsnummer && section.straße) {
            sections[section.abschnittsnummer] = section as Abschnitt;
            parsed++;
        }
    }

    console.log(`Parsed ${parsed} sections`);

    await Bun.write('src/data.json', JSON.stringify(sections, null, 2));
    console.log('Written to src/data.json');
}

main();
