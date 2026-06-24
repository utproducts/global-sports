// Landing-page copy per language. Page-level content lives here (not the global
// dictionary) so large copy blocks stay co-located and easy to translate.
import type { Lang } from "@/lib/i18n";

export type Card = { h: string; p: string };
export type HomeCopy = {
  heroEyebrow: string; heroH1a: string; heroH1b: string; heroP: string;
  scroll: string; tileLive: string; tileSoon: string;
  whyEyebrow: string; whyH2: string; whyP: string; why: Card[];
  audEyebrow: string; audH2: string; aud: Card[];
  howEyebrow: string; howH2: string; steps: Card[];
  memEyebrow: string; memH2: string; memNote: string; perYr: string; cur: string; popular: string;
  tierNames: [string, string, string]; tierFeatures: [string[], string[], string[]]; choose: string;
};

const en: HomeCopy = {
  heroEyebrow: "Adult Slow-Pitch · Worldwide",
  heroH1a: "Where do you play?", heroH1b: "Pick your region.",
  heroP: "Tap your region on the map to zoom in and choose your country — then scroll to see why one membership puts the whole world in play.",
  scroll: "Scroll to learn more about Global Sports",
  tileLive: "Live now", tileSoon: "Coming soon",
  whyEyebrow: "Why choose us", whyH2: "Built for players who want the real thing.",
  whyP: "Not a pickup league. A structured, ranked, cross-border championship system — with the local feel of your own country.",
  why: [
    { h: "One membership, worldwide", p: "Sign up once. Your Global Sports membership is valid in every country we run — play at home or abroad, no second fee." },
    { h: "A true championship path", p: "Pool play, brackets, classifications and player ratings that carry across events. Earn your way up, country to continent." },
    { h: "Your country, your way", p: "Every country runs as its own home — local language, currency and events — under one global standard." },
    { h: "Pay in your currency", p: "Local pricing, local VAT, local checkout. Powered by one secure platform so directors get paid and players stay protected." },
  ],
  audEyebrow: "Who it's for", audH2: "Built for everyone in the game.",
  aud: [
    { h: "Players", p: "One membership, every country, one global ranking. →" },
    { h: "Teams", p: "Manage your roster and register for events in clicks. →" },
    { h: "Organizers", p: "Run world-class tournaments with global reach. →" },
    { h: "Leagues", p: "Season-long league play under one standard. →" },
  ],
  howEyebrow: "How it works", howH2: "From sign-up to first pitch in three steps.",
  steps: [
    { h: "Pick your country", p: "Select where you play. We route you to your country's home, set up in your language and currency." },
    { h: "Create your membership", p: "One required Global Sports membership unlocks events everywhere. Choose Standard, Select or Elite." },
    { h: "Join a team & register", p: "Get added to a roster, register for tournaments, and start chasing the title." },
  ],
  memEyebrow: "Membership", memH2: "One membership. Valid everywhere.",
  memNote: "Buy once — play in any Global Sports country, no second fee",
  perYr: "/yr", cur: "Charged in your local currency + VAT", popular: "MOST POPULAR",
  tierNames: ["Standard", "Select", "Elite"],
  tierFeatures: [
    ["Required to register & play", "Player profile & rating", "Roster eligibility"],
    ["Everything in Standard", "Priority event registration", "Enhanced stats & history"],
    ["Everything in Select", "Premium membership card", "Early access to championships"],
  ],
  choose: "Choose your membership →",
};

const es: HomeCopy = {
  heroEyebrow: "Slow-Pitch Adulto · En todo el mundo",
  heroH1a: "¿Dónde juegas?", heroH1b: "Elige tu región.",
  heroP: "Toca tu región en el mapa para ampliarla y elegir tu país; luego desplázate para ver por qué una sola membresía pone el mundo entero en juego.",
  scroll: "Desplázate para conocer más sobre Global Sports",
  tileLive: "En vivo", tileSoon: "Próximamente",
  whyEyebrow: "Por qué elegirnos", whyH2: "Hecho para jugadores que quieren lo de verdad.",
  whyP: "No es una liga improvisada. Un sistema de campeonato estructurado, clasificado y transfronterizo, con el ambiente local de tu propio país.",
  why: [
    { h: "Una membresía, en todo el mundo", p: "Regístrate una vez. Tu membresía de Global Sports es válida en todos los países donde operamos: juega en casa o en el extranjero, sin segunda cuota." },
    { h: "Un verdadero camino al campeonato", p: "Juego de grupos, brackets, clasificaciones y valoraciones de jugadores que se mantienen entre eventos. Asciende, de tu país al continente." },
    { h: "Tu país, a tu manera", p: "Cada país funciona como su propia casa —idioma, moneda y eventos locales— bajo un único estándar global." },
    { h: "Paga en tu moneda", p: "Precios locales, IVA local, pago local. Impulsado por una plataforma segura para que los directores cobren y los jugadores estén protegidos." },
  ],
  audEyebrow: "Para quién es", audH2: "Hecho para todos en el juego.",
  aud: [
    { h: "Jugadores", p: "Una membresía, todos los países, una clasificación global. →" },
    { h: "Equipos", p: "Gestiona tu róster y regístrate en eventos con unos clics. →" },
    { h: "Organizadores", p: "Organiza torneos de clase mundial con alcance global. →" },
    { h: "Ligas", p: "Juego de liga durante toda la temporada bajo un mismo estándar. →" },
  ],
  howEyebrow: "Cómo funciona", howH2: "Del registro al primer lanzamiento en tres pasos.",
  steps: [
    { h: "Elige tu país", p: "Selecciona dónde juegas. Te llevamos a la casa de tu país, configurada en tu idioma y moneda." },
    { h: "Crea tu membresía", p: "Una membresía obligatoria de Global Sports desbloquea eventos en todas partes. Elige Standard, Select o Elite." },
    { h: "Únete a un equipo y regístrate", p: "Únete a un róster, regístrate en torneos y empieza a perseguir el título." },
  ],
  memEyebrow: "Membresía", memH2: "Una membresía. Válida en todas partes.",
  memNote: "Compra una vez: juega en cualquier país de Global Sports, sin segunda cuota",
  perYr: "/año", cur: "Cobrado en tu moneda local + IVA", popular: "MÁS POPULAR",
  tierNames: ["Standard", "Select", "Elite"],
  tierFeatures: [
    ["Obligatoria para registrarse y jugar", "Perfil y valoración del jugador", "Elegibilidad para róster"],
    ["Todo lo de Standard", "Registro prioritario a eventos", "Estadísticas e historial mejorados"],
    ["Todo lo de Select", "Tarjeta de membresía premium", "Acceso anticipado a campeonatos"],
  ],
  choose: "Elige tu membresía →",
};

const it: HomeCopy = {
  heroEyebrow: "Slow-Pitch Adulti · In tutto il mondo",
  heroH1a: "Dove giochi?", heroH1b: "Scegli la tua regione.",
  heroP: "Tocca la tua regione sulla mappa per ingrandirla e scegliere il tuo paese, poi scorri per scoprire perché un'unica iscrizione mette in gioco tutto il mondo.",
  scroll: "Scorri per saperne di più su Global Sports",
  tileLive: "Attivo ora", tileSoon: "Prossimamente",
  whyEyebrow: "Perché sceglierci", whyH2: "Creato per chi vuole giocare sul serio.",
  whyP: "Non un campionato improvvisato. Un sistema di campionato strutturato, con classifiche e oltre i confini, con l'atmosfera locale del tuo paese.",
  why: [
    { h: "Un'iscrizione, in tutto il mondo", p: "Iscriviti una volta. La tua iscrizione Global Sports è valida in ogni paese in cui operiamo: gioca a casa o all'estero, senza una seconda quota." },
    { h: "Un vero percorso verso il campionato", p: "Gironi, tabelloni, classi e valutazioni dei giocatori che valgono in tutti gli eventi. Scala le posizioni, dal paese al continente." },
    { h: "Il tuo paese, a modo tuo", p: "Ogni paese funziona come casa propria —lingua, valuta ed eventi locali— sotto un unico standard globale." },
    { h: "Paga nella tua valuta", p: "Prezzi locali, IVA locale, pagamento locale. Tutto su un'unica piattaforma sicura, così gli organizzatori vengono pagati e i giocatori sono protetti." },
  ],
  audEyebrow: "Per chi è", audH2: "Creato per tutti nel gioco.",
  aud: [
    { h: "Giocatori", p: "Un'iscrizione, ogni paese, una classifica globale. →" },
    { h: "Squadre", p: "Gestisci il roster e iscriviti agli eventi in pochi clic. →" },
    { h: "Organizzatori", p: "Organizza tornei di livello mondiale con portata globale. →" },
    { h: "Campionati", p: "Campionato per tutta la stagione sotto un unico standard. →" },
  ],
  howEyebrow: "Come funziona", howH2: "Dall'iscrizione al primo lancio in tre passi.",
  steps: [
    { h: "Scegli il tuo paese", p: "Seleziona dove giochi. Ti portiamo alla casa del tuo paese, configurata nella tua lingua e valuta." },
    { h: "Crea la tua iscrizione", p: "Un'iscrizione Global Sports obbligatoria sblocca gli eventi ovunque. Scegli Standard, Select o Elite." },
    { h: "Unisciti a una squadra e iscriviti", p: "Entra in un roster, iscriviti ai tornei e inizia a inseguire il titolo." },
  ],
  memEyebrow: "Iscrizione", memH2: "Un'iscrizione. Valida ovunque.",
  memNote: "Acquista una volta: gioca in qualsiasi paese Global Sports, senza una seconda quota",
  perYr: "/anno", cur: "Addebitato nella tua valuta locale + IVA", popular: "PIÙ POPOLARE",
  tierNames: ["Standard", "Select", "Elite"],
  tierFeatures: [
    ["Obbligatoria per iscriversi e giocare", "Profilo e valutazione del giocatore", "Idoneità al roster"],
    ["Tutto di Standard", "Iscrizione prioritaria agli eventi", "Statistiche e storico avanzati"],
    ["Tutto di Select", "Tessera d'iscrizione premium", "Accesso anticipato ai campionati"],
  ],
  choose: "Scegli la tua iscrizione →",
};

const de: HomeCopy = {
  heroEyebrow: "Adult Slow-Pitch · Weltweit",
  heroH1a: "Wo spielst du?", heroH1b: "Wähle deine Region.",
  heroP: "Tippe auf deine Region auf der Karte, um hineinzuzoomen und dein Land zu wählen – scrolle dann weiter, um zu sehen, warum eine Mitgliedschaft die ganze Welt ins Spiel bringt.",
  scroll: "Scrolle, um mehr über Global Sports zu erfahren",
  tileLive: "Jetzt aktiv", tileSoon: "Demnächst",
  whyEyebrow: "Warum wir", whyH2: "Gemacht für Spieler, die es ernst meinen.",
  whyP: "Keine Hobbyliga. Ein strukturiertes, gewertetes, länderübergreifendes Meisterschaftssystem – mit dem lokalen Gefühl deines eigenen Landes.",
  why: [
    { h: "Eine Mitgliedschaft, weltweit", p: "Einmal anmelden. Deine Global-Sports-Mitgliedschaft gilt in jedem Land, in dem wir aktiv sind – spiele zu Hause oder im Ausland, ohne zweite Gebühr." },
    { h: "Ein echter Weg zur Meisterschaft", p: "Gruppenspiele, Brackets, Klassifizierungen und Spielerbewertungen, die über Events hinweg gelten. Arbeite dich nach oben, vom Land zum Kontinent." },
    { h: "Dein Land, dein Weg", p: "Jedes Land funktioniert als eigenes Zuhause – lokale Sprache, Währung und Events – nach einem globalen Standard." },
    { h: "Zahle in deiner Währung", p: "Lokale Preise, lokale MwSt., lokale Kasse. Auf einer sicheren Plattform, damit Organisatoren bezahlt werden und Spieler geschützt sind." },
  ],
  audEyebrow: "Für wen", audH2: "Gemacht für alle im Spiel.",
  aud: [
    { h: "Spieler", p: "Eine Mitgliedschaft, jedes Land, eine globale Rangliste. →" },
    { h: "Teams", p: "Verwalte deinen Kader und melde dich in wenigen Klicks für Events an. →" },
    { h: "Organisatoren", p: "Veranstalte Weltklasse-Turniere mit globaler Reichweite. →" },
    { h: "Ligen", p: "Saisonlanger Ligabetrieb nach einem Standard. →" },
  ],
  howEyebrow: "So funktioniert's", howH2: "Von der Anmeldung zum ersten Pitch in drei Schritten.",
  steps: [
    { h: "Wähle dein Land", p: "Wähle, wo du spielst. Wir leiten dich zum Zuhause deines Landes, eingerichtet in deiner Sprache und Währung." },
    { h: "Erstelle deine Mitgliedschaft", p: "Eine erforderliche Global-Sports-Mitgliedschaft schaltet Events überall frei. Wähle Standard, Select oder Elite." },
    { h: "Tritt einem Team bei & melde dich an", p: "Lass dich einem Kader hinzufügen, melde dich für Turniere an und jage den Titel." },
  ],
  memEyebrow: "Mitgliedschaft", memH2: "Eine Mitgliedschaft. Überall gültig.",
  memNote: "Einmal kaufen – in jedem Global-Sports-Land spielen, ohne zweite Gebühr",
  perYr: "/Jahr", cur: "Abrechnung in deiner lokalen Währung + MwSt.", popular: "AM BELIEBTESTEN",
  tierNames: ["Standard", "Select", "Elite"],
  tierFeatures: [
    ["Erforderlich zum Anmelden & Spielen", "Spielerprofil & Bewertung", "Kader-Berechtigung"],
    ["Alles aus Standard", "Bevorzugte Event-Anmeldung", "Erweiterte Statistiken & Verlauf"],
    ["Alles aus Select", "Premium-Mitgliedskarte", "Früher Zugang zu Meisterschaften"],
  ],
  choose: "Wähle deine Mitgliedschaft →",
};

export const HOME: Record<Lang, HomeCopy> = { en, es, it, de };
