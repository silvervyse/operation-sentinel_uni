import { assetPath } from '../../utils/asset-path';

/**
 * Konfiguration für die generischen Laptop-Levels (nach dem Tutorial).
 * Jedes Level hat einen Pool aus Passwörtern + passenden Hinweisen + Akte-Seiten.
 * Beim Start wird ein zufälliges Set aus dem Pool gewählt.
 */

export interface PasswordSet {
  password: string;
  /** Optionales Wort das auf einer Akte-Seite angezeigt wird */
  displayWord?: string;
  /** Auf welcher Seite (0-indexed) das displayWord angezeigt wird */
  displayWordPage?: number;
  /** Mehrere Parts auf verschiedenen Seiten (z.B. Zeichenpaare) */
  displayParts?: { page: number; text: string; position?: 'top' | 'center' | 'bottom' }[];
  /** Mehrzeilige Textblöcke pro Seite (z.B. Datenleak-Einträge) */
  displayBlocks?: { page: number; lines: string[]; title?: string }[];
  /** Tastatur-Anzeige: Markiert bestimmte Tasten auf einer Seite */
  displayKeyboard?: { page: number; highlightKeys: string[] };
  /** Zeitungsausschnitt auf einer Seite */
  displayNewspaper?: { page: number; date: string };
  /** Bild-Overlay auf einer Seite */
  displayImage?: { page: number; src: string; width?: string }[];
  /** Post-It Overlays mit echtem + Fake-Texten */
  displayPostIts?: { page: number; realText: string; fakeText: string; fakeText2: string }[];
  /** E-Mail Overlay auf einer Seite */
  displayEmail?: { page: number; from: string; to: string; subject: string; date: string; body: string[] };
  /** Interview/Blog-Artikel Overlay */
  displayInterview?: { page: number; portraitSrc: string; lines: { speaker: string; text: string }[] };
  /** Datumsstempel auf einer Seite (wie ein Eingangsstempel) */
  displayStamp?: { page: number; label?: string; date: string };
  hints: { atAttempts: number; introText: string; detailText: string }[];
  aktePages: string[];
}

export interface LaptopLevelConfig {
  id: string;
  laptopImage: string;
  deskBackground: string;
  akteImage: string;
  akteFrameImage: string;
  laptopZoomBackground: string;
  passwordPool: PasswordSet[];
  learningParagraphs: string[];
  fileName: string;
}

// === Platzhalter-Configs für Laptop 1–4 ===

const LAPTOP_1_DATA = [
  { parts: ['ma', 'sa', 'op', '27'], password: 'masaop27' },
  { parts: ['ki', 'to', 'ev', '42'], password: 'kitoev42' },
  { parts: ['lu', 'ra', 'im', '18'], password: 'luraim18' },
  { parts: ['po', 'ne', 'ux', '53'], password: 'poneux53' },
  { parts: ['da', 'fi', 'ok', '91'], password: 'dafiok91' },
  { parts: ['be', 'mu', 'at', '36'], password: 'bemuat36' },
  { parts: ['go', 'li', 'ep', '74'], password: 'goliep74' },
  { parts: ['tu', 'ka', 'oz', '25'], password: 'tukaoz25' },
  { parts: ['vo', 'se', 'ib', '68'], password: 'voseib68' },
  { parts: ['ni', 'pa', 'ur', '47'], password: 'nipaur47' },
  { parts: ['he', 'do', 'ax', '83'], password: 'hedoax83' },
  { parts: ['ri', 'fu', 'em', '12'], password: 'rifuem12' },
  { parts: ['zo', 'na', 'ik', '59'], password: 'zonaik59' },
  { parts: ['ce', 'vo', 'up', '34'], password: 'cevoup34' },
  { parts: ['ja', 'mi', 'ex', '77'], password: 'jamiex77' },
  { parts: ['su', 'te', 'ol', '26'], password: 'suteol26' },
  { parts: ['bo', 'ri', 'af', '65'], password: 'boriaf65' },
  { parts: ['pe', 'la', 'uz', '40'], password: 'pelauz40' },
  { parts: ['ko', 'di', 'et', '88'], password: 'kodiet88' },
  { parts: ['fa', 'nu', 'ox', '31'], password: 'fanuox31' },
];

/** Generiert einen zufälligen Fake-Wert für Post-Its (Konsonant+Vokal oder zwei Zahlen) */
function generateFake(isNumber: boolean): string {
  if (isNumber) {
    return String(Math.floor(Math.random() * 90) + 10);
  }
  const consonants = 'bcdfghjklmnpqrstvwxyz';
  const vowels = 'aeiou';
  return consonants[Math.floor(Math.random() * consonants.length)] + vowels[Math.floor(Math.random() * vowels.length)];
}

const LAPTOP_1: LaptopLevelConfig = {
  id: 'laptop-1',
  laptopImage: assetPath('/assets/images/Mission1/Laptops/Laptop1.webp'),
  deskBackground: assetPath('/assets/images/Mission1/Hintergründe/Schreibtisch.webp'),
  akteImage: assetPath('/assets/images/Mission1/Akten/Akte-Tisch.webp'),
  akteFrameImage: assetPath('/assets/images/Mission1/Hintergründe/Akte aufgeschlagen.webp'),
  laptopZoomBackground: assetPath('/assets/images/Mission1/Hintergründe/Laptop-zoom.webp'),
  passwordPool: LAPTOP_1_DATA.map(({ parts, password }) => ({
    password,
    displayPostIts: [
      { page: 0, realText: parts[0], fakeText: generateFake(false), fakeText2: 'zu' },
      { page: 1, realText: parts[1], fakeText: generateFake(false), fakeText2: 'xi' },
      { page: 2, realText: parts[2] + parts[3], fakeText: generateFake(false) + generateFake(true), fakeText2: 'meko' },
    ],
    hints: [
      { atAttempts: 3, introText: 'Wir konnten einen weiteren Hinweis sichern:', detailText: 'Das Passwort enthält zwei Zahlen' },
      { atAttempts: 6, introText: 'Außerdem haben wir gerade herausgefunden:', detailText: 'Das Passwort wird ohne Leerzeichen zusammengesetzt. Kombiniere die richtigen Notizen.' },
    ],
    aktePages: [
      assetPath('/assets/images/Mission1/Akten/Laptop1/Seite1.webp'),
      assetPath('/assets/images/Mission1/Akten/Laptop1/Seite2.webp'),
      assetPath('/assets/images/Mission1/Akten/Laptop1/Seite3.webp'),
    ],
  })),
  learningParagraphs: [
    'Das war wieder viel zu einfach.',
    'Selbst das sicherste Passwort hilft nicht, wenn man es frei zugänglich auf einem oder mehreren Post-Its notiert.',
    'Merke: Notiere niemals ein Passwort auf einem Zettel – nutze stattdessen einen Passwortmanager.',
  ],
  fileName: 'Akte_Verdächtiger_3.pdf',
};

const LAPTOP_2_WORDS = [
  { word: 'Sommer', password: 'Sommer26!', category: 'jahreszeit' },
  { word: 'Winter', password: 'Winter26!', category: 'jahreszeit' },
  { word: 'Fruehling', password: 'Fruehling26!', category: 'jahreszeit' },
  { word: 'Herbst', password: 'Herbst26!', category: 'jahreszeit' },
  { word: 'Montag', password: 'Montag26!', category: 'tag' },
  { word: 'Dienstag', password: 'Dienstag26!', category: 'tag' },
  { word: 'Mittwoch', password: 'Mittwoch26!', category: 'tag' },
  { word: 'Donnerstag', password: 'Donnerstag26!', category: 'tag' },
  { word: 'Freitag', password: 'Freitag26!', category: 'tag' },
  { word: 'Samstag', password: 'Samstag26!', category: 'tag' },
  { word: 'Sonntag', password: 'Sonntag26!', category: 'tag' },
  { word: 'Januar', password: 'Januar26!', category: 'monat' },
  { word: 'Februar', password: 'Februar26!', category: 'monat' },
  { word: 'Maerz', password: 'Maerz26!', category: 'monat' },
  { word: 'April', password: 'April26!', category: 'monat' },
  { word: 'Mai', password: 'Mai26!', category: 'monat' },
  { word: 'Juni', password: 'Juni26!', category: 'monat' },
  { word: 'Juli', password: 'Juli26!', category: 'monat' },
  { word: 'August', password: 'August26!', category: 'monat' },
  { word: 'September', password: 'September26!', category: 'monat' },
];

const LAPTOP_2: LaptopLevelConfig = {
  id: 'laptop-2',
  laptopImage: assetPath('/assets/images/Mission1/Laptops/Laptop2.webp'),
  deskBackground: assetPath('/assets/images/Mission1/Hintergründe/Schreibtisch.webp'),
  akteImage: assetPath('/assets/images/Mission1/Akten/Akte-Tisch.webp'),
  akteFrameImage: assetPath('/assets/images/Mission1/Hintergründe/Akte aufgeschlagen.webp'),
  laptopZoomBackground: assetPath('/assets/images/Mission1/Hintergründe/Laptop-zoom.webp'),
  passwordPool: LAPTOP_2_WORDS.map(({ word, password, category }) => {
    const categoryLabel = category === 'jahreszeit' ? 'Jahreszeit' : category === 'tag' ? 'Wochentag' : 'Monat';
    return {
      password,
      displayWord: word,
      displayWordPage: 2,
      displayStamp: { page: 0, label: 'EINGEGANGEN', date: new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) },
      displayBlocks: [
        {
          page: 0,
          title: 'Protokollauszug – Was wir wissen:',
          lines: [
            'Der Besitzer ändert sein Passwort regelmäßig.',
            '',
            'Auffällig:',
            '• Es tauchen immer wieder ähnliche Begriffe auf',
            '• Am Ende sind immer zwei Zahlen im Passwort',
            '• Sonderzeichen werden vermutlich nur ergänzt,',
            '  um „sicherer" zu wirken',
          ],
        },
      ],
      displayEmail: {
        page: 1,
        from: 'info@online-shop.de',
        to: 'mila.meier@mail.de',
        subject: 'Passwortänderung',
        date: '12.01.2025',
        body: [
          'Sie haben Ihr Passwort erfolgreich geändert.',
          '',
          'Altes Passwort: Erdbeere24!',
          'Neues Passwort: Erdbeere25!',
          '',
          'Das waren nicht Sie? Dann melden Sie sich umgehend an unseren Support.',
        ],
      },
      displayInterview: {
        page: 2,
        portraitSrc: assetPath('/assets/images/Mission1/Akten/Laptop2/Portrait.webp'),
        lines: [
          { speaker: '', text: 'Kurzinterview mit Mila Meier, Chefredakteurin von MyStyle' },
          { speaker: 'Redaktion', text: 'Frau Meier, beginnen wir mit einer einfachen Frage: Was ist Ihre Lieblingsfrucht?' },
          { speaker: 'Mila Meier', text: 'Ganz klar – Erdbeeren. Die gehen einfach immer.' },
          { speaker: 'Redaktion', text: `Lieblings${categoryLabel.toLowerCase()}?` },
          { speaker: 'Mila Meier', text: `Definitiv ${word}. Da fühle ich mich am fittesten.` },
          { speaker: 'Redaktion', text: 'Zum Schluss noch eine persönliche Frage: Was ist Ihre Lieblingsfarbe?' },
          { speaker: 'Mila Meier', text: 'Rot. Ich mag kräftige Farben mit Charakter.' },
        ],
      },
      hints: [
        { atAttempts: 3, introText: 'Wir konnten einen weiteren Hinweis sichern:', detailText: 'Das Passwort ist eine Kombination aus Text, Zahlen und einem ! am Ende.' },
        { atAttempts: 6, introText: 'Außerdem haben wir gerade herausgefunden:', detailText: 'Das Wort stammt wahrscheinlich aus Kalender, Jahreszeit oder Monat. Die Zahl hat einen Bezug zum aktuellen Jahr.' },
      ],
      aktePages: [
        
        assetPath('/assets/images/Mission1/Akten/Laptop2/Seite1.webp'),
        assetPath('/assets/images/Mission1/Akten/Laptop2/Seite2.webp'),
        assetPath('/assets/images/Mission1/Akten/Laptop2/Seite3.webp'),
      ],
    };
  }),
  learningParagraphs: [
    'Viel verwendete Wörter wie hier Jahreszeiten, Monate oder Wochentage kombiniert mit kurzen Zahlen sind extrem häufige Passwortmuster.',
    'Angreifer nutzen sogenannte Wörterbuch-Attacken: Sie probieren systematisch gängige Wörter in Kombination mit Zahlen durch.',
    'Merke: Ein sicheres Passwort sollte keine Wörter enthalten, die in einem Wörterbuch stehen – auch nicht in Kombination mit kurzen Zahlen oder Sonderzeichen.',
    'Eine Ausnahme bilden Passphrasen, die aus mehreren Wörtern bestehen wie z.B. Samstag!Sommer2Mai',
  ],
  fileName: 'Protokoll_Überwachung.pdf',
};

const LAPTOP_3_DATA = [
  { password: 'qwertz1407', keyboardPattern: 'qwertz', date: '14.07.' },
  { password: 'wertzu2304', keyboardPattern: 'wertzu', date: '23.04.' },
  { password: 'ertzui3112', keyboardPattern: 'ertzui', date: '31.12.' },
  { password: 'rtzuio0101', keyboardPattern: 'rtzuio', date: '01.01.' },
  { password: 'tzuiop1509', keyboardPattern: 'tzuiop', date: '15.09.' },
  { password: 'asdfgh0811', keyboardPattern: 'asdfgh', date: '08.11.' },
  { password: 'sdfghj1205', keyboardPattern: 'sdfghj', date: '12.05.' },
  { password: 'dfghjk1708', keyboardPattern: 'dfghjk', date: '17.08.' },
  { password: 'fghjkl3003', keyboardPattern: 'fghjkl', date: '30.03.' },
  { password: 'yxcvbn1910', keyboardPattern: 'yxcvbn', date: '19.10.' },
  { password: 'xcvbnm0407', keyboardPattern: 'xcvbnm', date: '04.07.' },
  { password: 'poiuzt2908', keyboardPattern: 'poiuzt', date: '29.08.' },
  { password: 'oiuztr1311', keyboardPattern: 'oiuztr', date: '13.11.' },
  { password: 'iuztre2106', keyboardPattern: 'iuztre', date: '21.06.' },
  { password: 'äölkjh0512', keyboardPattern: 'äölkjh', date: '05.12.' },
  { password: 'lkjhgf1604', keyboardPattern: 'lkjhgf', date: '16.04.' },
  { password: 'mnbvcx2709', keyboardPattern: 'mnbvcx', date: '27.09.' },
  { password: 'nbvcxy1010', keyboardPattern: 'nbvcxy', date: '10.10.' },
];

const LAPTOP_3: LaptopLevelConfig = {
  id: 'laptop-3',
  laptopImage: assetPath('/assets/images/Mission1/Laptops/Laptop3.webp'),
  deskBackground: assetPath('/assets/images/Mission1/Hintergr\u00fcnde/Schreibtisch.webp'),
  akteImage: assetPath('/assets/images/Mission1/Akten/Akte-Tisch.webp'),
  akteFrameImage: assetPath('/assets/images/Mission1/Hintergr\u00fcnde/Akte aufgeschlagen.webp'),
  laptopZoomBackground: assetPath('/assets/images/Mission1/Hintergr\u00fcnde/Laptop-zoom.webp'),
  passwordPool: LAPTOP_3_DATA.map(({ password, keyboardPattern, date }) => ({
    password,
    displayKeyboard: { page: 1, highlightKeys: keyboardPattern.split('') },
    displayNewspaper: { page: 2, date },
    displayImage: [{ page: 0, src: assetPath('/assets/images/Mission1/Akten/Laptop3/Steckbrief.webp'), width: '75%' }],
    hints: [
      { atAttempts: 3, introText: 'Wir konnten einen weiteren Hinweis sichern:', detailText: 'Der Besitzer ist vergesslich, sein Passwort ist immer vor ihm.' },
      { atAttempts: 6, introText: 'Außerdem haben wir gerade herausgefunden:', detailText: 'Es ist eine Tastaturfolge + ein wichtiges Datum (ohne Sonderzeichen).' },
    ],
    aktePages: [
      assetPath('/assets/images/Mission1/Akten/Laptop3/Seite1.webp'),
      assetPath('/assets/images/Mission1/Akten/Laptop3/Seite2.webp'),
      assetPath('/assets/images/Mission1/Akten/Laptop3/Seite3.webp'),
    ],
  })),
  learningParagraphs: [
    'Geschafft! Dieses Passwort war leichter zu knacken als gedacht. Der Anfang ist lediglich eine Buchstabenreihe einer deutschen Tastatur.',
    'Solche Tastaturfolgen geh\u00f6ren zu den ersten Mustern, die Angreifer ausprobieren.',
    'Auch die Zahlen sind problematisch: Sie stehen f\u00fcr ein pers\u00f6nliches Datum. Solche Daten lassen sich h\u00e4ufig \u00fcber soziale Medien herausfinden.',
    'Merke: Sichere Passw\u00f6rter bestehen nicht aus Tastaturmustern oder pers\u00f6nlichen Daten, sondern sind lang und zuf\u00e4llig.',
  ],
  fileName: 'Kommunikationslog_encrypted.pdf',
};

const LAPTOP_4_DATA = [
  { password: 'Laptop!4568', shopping: 'Shopping!4568', mail: 'Mail!4568', banking: 'Banking!4568' },
  { password: 'Laptop!1824', shopping: 'Shopping!1824', mail: 'Mail!1824', banking: 'Banking!1824' },
  { password: 'Laptop!7305', shopping: 'Shopping!7305', mail: 'Mail!7305', banking: 'Banking!7305' },
  { password: 'Laptop!9142', shopping: 'Shopping!9142', mail: 'Mail!9142', banking: 'Banking!9142' },
  { password: 'Laptop!2679', shopping: 'Shopping!2679', mail: 'Mail!2679', banking: 'Banking!2679' },
  { password: 'Laptop!5081', shopping: 'Shopping!5081', mail: 'Mail!5081', banking: 'Banking!5081' },
  { password: 'Laptop!3496', shopping: 'Shopping!3496', mail: 'Mail!3496', banking: 'Banking!3496' },
  { password: 'Laptop!7754', shopping: 'Shopping!7754', mail: 'Mail!7754', banking: 'Banking!7754' },
  { password: 'Laptop!6218', shopping: 'Shopping!6218', mail: 'Mail!6218', banking: 'Banking!6218' },
  { password: 'Laptop!1437', shopping: 'Shopping!1437', mail: 'Mail!1437', banking: 'Banking!1437' },
  { password: 'Laptop!8903', shopping: 'Shopping!8903', mail: 'Mail!8903', banking: 'Banking!8903' },
  { password: 'Laptop!2541', shopping: 'Shopping!2541', mail: 'Mail!2541', banking: 'Banking!2541' },
  { password: 'Laptop!6670', shopping: 'Shopping!6670', mail: 'Mail!6670', banking: 'Banking!6670' },
  { password: 'Laptop!3159', shopping: 'Shopping!3159', mail: 'Mail!3159', banking: 'Banking!3159' },
  { password: 'Laptop!4826', shopping: 'Shopping!4826', mail: 'Mail!4826', banking: 'Banking!4826' },
  { password: 'Laptop!9517', shopping: 'Shopping!9517', mail: 'Mail!9517', banking: 'Banking!9517' },
  { password: 'Laptop!7064', shopping: 'Shopping!7064', mail: 'Mail!7064', banking: 'Banking!7064' },
  { password: 'Laptop!1289', shopping: 'Shopping!1289', mail: 'Mail!1289', banking: 'Banking!1289' },
  { password: 'Laptop!5732', shopping: 'Shopping!5732', mail: 'Mail!5732', banking: 'Banking!5732' },
  { password: 'Laptop!8405', shopping: 'Shopping!8405', mail: 'Mail!8405', banking: 'Banking!8405' },
];

const LAPTOP_4: LaptopLevelConfig = {
  id: 'laptop-4',
  laptopImage: assetPath('/assets/images/Mission1/Laptops/Laptop4.webp'),
  deskBackground: assetPath('/assets/images/Mission1/Hintergründe/Schreibtisch.webp'),
  akteImage: assetPath('/assets/images/Mission1/Akten/Akte-Tisch.webp'),
  akteFrameImage: assetPath('/assets/images/Mission1/Hintergründe/Akte aufgeschlagen.webp'),
  laptopZoomBackground: assetPath('/assets/images/Mission1/Hintergründe/Laptop-zoom.webp'),
  passwordPool: LAPTOP_4_DATA.map(({ password, shopping, mail, banking }) => ({
    password,
    displayBlocks: [
      {
        page: 0,
        title: 'Ermittlungsbericht',
        lines: [
          'Unsere Ermittler konnten mehrere Datenlecks',
          'betreffend Accounts von Herrn Max Müller',
          'feststellen.',
        ],
      },
      {
        page: 0,
        title: '🔓 Datenleak: shop-express.de',
        lines: [
          'Benutzer: max.mueller84',
          `Passwort: ${shopping}`,
        ],
      },
      {
        page: 1,
        title: '🔓 Datenleak: freemail-plus.net',
        lines: [
          'Benutzer: max.mueller84',
          `Passwort: ${mail}`,
        ],
      },
      {
        page: 2,
        title: '🔓 Datenleak: mein-banking24.de',
        lines: [
          'Benutzer: max.mueller84',
          `Passwort: ${banking}`,
        ],
      },
    ],
    hints: [
      { atAttempts: 3, introText: 'Wir konnten einen weiteren Hinweis sichern:', detailText: 'Der Besitzer verwendet dasselbe Muster für alle seine Passwörter.' },
      { atAttempts: 6, introText: 'Außerdem haben wir gerade herausgefunden:', detailText: 'Das Schema ist: Dienst/Gerät + ! + vierstellige Zahl.' },
    ],
    aktePages: [
      assetPath('/assets/images/Mission1/Akten/Laptop4/Seite1.webp'),
      assetPath('/assets/images/Mission1/Akten/Laptop4/Seite2.webp'),
      assetPath('/assets/images/Mission1/Akten/Laptop4/Seite3.webp'),
    ],
  })),
  learningParagraphs: [
    'Hier wurde dasselbe Passwort-Schema für alle Dienste verwendet: Ein Wort + Sonderzeichen + Zahl.',
    'Wer ein Passwort kennt, kann so leicht alle anderen erraten. Dieses Muster nennt man Password Reuse.',
    'Merke: Verwende für jeden Dienst ein eigenes, einzigartiges Passwort. Ein Passwortmanager hilft dabei.',
  ],
  fileName: 'Finanzbericht_Q4.pdf',
};

/** Alle Levels in fester Reihenfolge (zum Testen) */
export const LEVELS_FIXED_ORDER: LaptopLevelConfig[] = [LAPTOP_1, LAPTOP_2, LAPTOP_3, LAPTOP_4];

/** Gibt die Levels in zufälliger Reihenfolge zurück */
export function getRandomizedLevels(): LaptopLevelConfig[] {
  const shuffled = [...LEVELS_FIXED_ORDER];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/** Wählt ein zufälliges PasswordSet aus dem Pool */
export function pickRandomPasswordSet(config: LaptopLevelConfig): PasswordSet {
  const index = Math.floor(Math.random() * config.passwordPool.length);
  return config.passwordPool[index];
}
