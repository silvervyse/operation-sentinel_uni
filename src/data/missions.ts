import type { Mission } from '../types/game.types';

export const MISSIONS: readonly Mission[] = [
  {
    id: 'phishing-01',
    title: 'Operation: Phishing-Alarm',
    description:
      'Ein verdächtiger E-Mail-Angriff wurde gemeldet. Analysiere die Situation und triff die richtigen Entscheidungen, um den Angriff abzuwehren.',
    category: 'phishing',
    scenarios: [
      {
        id: 'phishing-01-s1',
        context:
          'Du erhältst eine E-Mail mit dem Betreff "Dringende Passwort-Änderung erforderlich" von "it-support@firna.de" (Tippfehler in der Domain). Die E-Mail enthält einen Link zur angeblichen Passwort-Änderungsseite.',
        correctChoiceId: 'phishing-01-s1-c2',
        choices: [
          {
            id: 'phishing-01-s1-c1',
            text: 'Auf den Link klicken und das Passwort ändern — es könnte wichtig sein.',
            points: 0,
            feedback:
              'Vorsicht! Die Domain "firna.de" enthält einen Tippfehler. Legitime IT-Abteilungen nutzen immer die korrekte Firmendomain. Niemals Links in verdächtigen E-Mails anklicken.',
            isCorrect: false,
          },
          {
            id: 'phishing-01-s1-c2',
            text: 'Die E-Mail als verdächtig melden und die IT-Abteilung direkt kontaktieren.',
            points: 10,
            feedback:
              'Richtig! Die falsche Domain "firna.de" ist ein klares Warnsignal. Die IT-Abteilung zu kontaktieren ist der sicherste Weg.',
            isCorrect: true,
          },
          {
            id: 'phishing-01-s1-c3',
            text: 'Die E-Mail ignorieren und löschen.',
            points: 5,
            feedback:
              'Löschen ist besser als Klicken, aber das Melden an die IT-Abteilung hilft, andere Kollegen zu warnen.',
            isCorrect: false,
          },
        ],
      },
      {
        id: 'phishing-01-s2',
        context:
          'Dein Vorgesetzter schickt dir per WhatsApp eine Nachricht: "Kannst du schnell eine Überweisung von 5.000€ an diesen Lieferanten machen? Bin gerade im Meeting, kann nicht telefonieren. Hier die IBAN: DE89..."',
        correctChoiceId: 'phishing-01-s2-c3',
        choices: [
          {
            id: 'phishing-01-s2-c1',
            text: 'Die Überweisung sofort durchführen — der Chef hat es eilig.',
            points: 0,
            feedback:
              'Stopp! Dies ist ein klassischer CEO-Fraud. Finanzielle Anweisungen über Messenger ohne Verifizierung sollten nie befolgt werden.',
            isCorrect: false,
          },
          {
            id: 'phishing-01-s2-c2',
            text: 'Per WhatsApp zurückfragen, ob es wirklich von ihm kommt.',
            points: 3,
            feedback:
              'Der Kanal selbst könnte kompromittiert sein. Besser ist es, über einen separaten Kommunikationsweg (z.B. Anruf) zu verifizieren.',
            isCorrect: false,
          },
          {
            id: 'phishing-01-s2-c3',
            text: 'Den Vorgesetzten über einen anderen Kanal (Telefon, persönlich) kontaktieren zur Verifizierung.',
            points: 10,
            feedback:
              'Perfekt! Bei unerwarteten finanziellen Anfragen immer über einen separaten Kanal verifizieren. Das ist die beste Abwehr gegen CEO-Fraud.',
            isCorrect: true,
          },
        ],
      },
      {
        id: 'phishing-01-s3',
        context:
          'Du findest einen USB-Stick auf dem Parkplatz vor dem Bürogebäude. Er ist mit "Gehaltsliste Q4" beschriftet.',
        correctChoiceId: 'phishing-01-s3-c2',
        choices: [
          {
            id: 'phishing-01-s3-c1',
            text: 'Den USB-Stick an deinem Arbeitsrechner anschließen, um den Besitzer zu identifizieren.',
            points: 0,
            feedback:
              'Niemals unbekannte USB-Sticks anschließen! Dies ist eine bekannte Angriffsmethode ("USB-Dropping"). Der Stick könnte Malware enthalten.',
            isCorrect: false,
          },
          {
            id: 'phishing-01-s3-c2',
            text: 'Den USB-Stick bei der IT-Abteilung abgeben ohne ihn anzuschließen.',
            points: 10,
            feedback:
              'Genau richtig! Die IT-Abteilung kann den Stick sicher überprüfen. USB-Dropping ist eine verbreitete Social-Engineering-Technik.',
            isCorrect: true,
          },
          {
            id: 'phishing-01-s3-c3',
            text: 'Den USB-Stick liegen lassen — ist nicht dein Problem.',
            points: 3,
            feedback:
              'Besser als anschließen, aber jemand anderes könnte ihn finden und einstecken. Am besten der IT-Abteilung übergeben.',
            isCorrect: false,
          },
        ],
      },
    ],
  },
] as const;
