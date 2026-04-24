import { expect, test, describe } from "bun:test";
import data from "./src/data.json";
import { Abschnitt } from "./parse";

const str = await Bun.file("./src/data.json").text()

describe("Abschnittsnummer 4", () => {
    const data = JSON.parse(str, reviver) as Map<string, Abschnitt>;
    const section = data.get("4")

    if (!section) {
        throw new Error("No section")
    }

    test("has correct abschnittsnummer", () => {
        expect(section.abschnittsnummer).toBe("4");
    });

    test("has correct straße", () => {
        expect(section.straße).toBe("Gutenbergstraße");
    });

    test("has correct abschnitt", () => {
        expect(section.abschnitt).toBe("zw. Hans-Thoma-Straße und Berliner Straße");
    });

    test("has correct bereich", () => {
        expect(section.bereich).toBe("M 1");
    });

    test("has correct radnetzfunktion", () => {
        expect(section.radnetzfunktion).toBe("Plusroute");
    });

    test("has correct längeInMeter", () => {
        expect(section.längeInMeter).toBe(189);
    });

    test("has correct bewertungFührungsform", () => {
        expect(section.bewertungFührungsform).toBe(1);
    });

    test("has correct bewertungAnlagenzustand", () => {
        expect(section.bewertungAnlagenzustand).toBe(6);
    });

    test("has correct gesamtBewertung", () => {
        expect(section.bewertungGesamt).toBe(6);
    });

    test("has correct verkehrssicherheit", () => {
        expect(section.verkehrssicherheit).toBe("keine Auffälligkeit");
    });

    test("has correct maßnahmen", () => {
        expect(section.maßnahmen).toBe("Bau eines Zweirichtungsradwegs auf der Südseite inklusive Überleitung in die Gutenbergstraße.");
    });

    test("has correct kommentar", () => {
        expect(section.kommentar).toBe("viele Geisterradler in Fahrtrichtung Innenstadt Für die Umsetzung ist Grunderwerb notwendig.");
    });

    test("has correct priority", () => {
        expect(section.prioritaet?.radnetzfunktion).toBe(3);
        expect(section.prioritaet?.bewertung_soll_ist).toBe(3);
        expect(section.prioritaet?.radverkehrsmengen).toBe(4);
        expect(section.prioritaet?.prioritaet_1).toBe(10);
        expect(section.prioritaet?.prioritaet_2).toBe(undefined);
    });

    describe("kfzVerkehr", () => {
        const kfzVerkehr = section.kfzVerkehr;

        test("has correct summeKfzSpitzenstunde", () => {
            expect(kfzVerkehr.summeKfzSpitzenstunde).toBe(1600);
        });

        test("has correct kfzParkenAufstellform", () => {
            expect(kfzVerkehr.kfzParkenAufstellform).toBe("Parken nicht vorhanden oder nicht relevant");
        });

        test("has correct sicherheitsabstandParken", () => {
            expect(kfzVerkehr.sicherheitsabstandParken).toBe("Parken nicht vorhanden oder nicht relevant");
        });

        test("has correct zulässigeHöchstgeschwindigkeit", () => {
            expect(kfzVerkehr.zulässigeHöchstgeschwindigkeit).toBe("30/50");
        });
    });
});


function reviver(key, value) {
    if (typeof value === 'object' && value !== null) {
        if (value.dataType === 'Map') {
            return new Map(value.value);
        }
    }
    return value;
}
