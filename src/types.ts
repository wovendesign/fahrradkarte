export interface Prioritaet {
    radnetzfunktion: number;
    bewertung_soll_ist: number;
    radverkehrsmengen: number;
    prioritaet_1?: number;
    prioritaet_2?: number;
    prioritaet_3?: number;
}

export interface KfzVerkehr {
    zulässigeHöchstgeschwindigkeit: string;
    sicherheitsabstandParken: string;
    kfzParkenAufstellform: string;
    summeKfzSpitzenstunde: number;
}

export interface Abschnitt {
    abschnittsnummer: string;
    straße: string;
    abschnitt: string;
    bereich: string;
    lage: string;
    längeInMeter: number;
    radnetzfunktion: string;
    führungsform: string;
    bewertungFührungsform: number;
    bewertungAnlagenzustand: number;
    bewertungGesamt: number;
    verkehrssicherheit: string;
    maßnahmen: string;
    kommentar: string;
    prioritaet: Prioritaet;
    kfzVerkehr?: KfzVerkehr;
}
