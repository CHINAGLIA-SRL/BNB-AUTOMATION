/**
 * ============================================================================
 *  Chinaglia SRL — Endpoint modulo "Prenota una chiamata"
 *  Google Apps Script Web App: invia l'EMAIL di notifica  +  aggiunge una RIGA
 *  al foglio Google (esportabile in Excel) ad ogni invio del modulo.
 * ============================================================================
 *
 *  COME ATTIVARLO (5 minuti, gratis):
 *  1. Crea un nuovo foglio su https://sheets.google.com
 *  2. Menu: Estensioni → Apps Script
 *  3. Cancella il codice di esempio e incolla TUTTO questo file.
 *  4. Controlla NOTIFY_EMAIL qui sotto (già impostata).
 *  5. In alto: Esegui ▸ una volta la funzione "setup" per autorizzare i permessi
 *     (Google chiederà l'accesso a Gmail e Fogli: consenti).
 *  6. Deploy ▸ Nuova distribuzione ▸ tipo "App web"
 *       - Esegui come:  Me stesso
 *       - Chi ha accesso:  Chiunque
 *     ▸ Distribuisci, copia l'URL che termina con  /exec
 *  7. Incolla quell'URL in app.js → CONFIG.FORM_ENDPOINT
 *     e imposta CONFIG.PROTOTYPE_MODE = false
 *
 *  Ad ogni modifica al codice ricordati di creare una NUOVA distribuzione
 *  (oppure "Gestisci distribuzioni" → modifica → versione "Nuova").
 * ----------------------------------------------------------------------------
 */

// Email che riceve le notifiche dei nuovi lead
const NOTIFY_EMAIL = "info@chinagliafederico.com";

// Oggetto dell'email
const SUBJECT = "New Lead - BNB Automation";

// Nome del foglio (tab) in cui scrivere le righe. Viene creato se non esiste.
const SHEET_NAME = "Lead";

// Intestazioni di colonna (devono combaciare con l'ordine in appendRow più sotto)
const HEADERS = [
  "Data e ora", "Nome e cognome", "Nome struttura", "Tipo struttura", "Città",
  "Telefono", "Email", "Strumenti usati", "Attività manuale", "Fascia oraria"
];

/**
 * Riceve l'invio del modulo (POST form-encoded), aggiunge la riga e invia l'email.
 */
function doPost(e) {
  try {
    const p = (e && e.parameter) ? e.parameter : {};
    const now = new Date();

    // --- 1) Riga nel foglio ---
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    if (sh.getLastRow() === 0) {
      sh.appendRow(HEADERS);
      sh.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
      sh.setFrozenRows(1);
    }
    sh.appendRow([
      now,
      p.nome || "",
      p.struttura || "",
      p.tipo_struttura || "",
      p.citta || "",
      p.telefono || "",
      p.email || "",
      p.strumenti || "",
      p.attivita_manuale || "",
      p.fascia_oraria || ""
    ]);

    // --- 2) Email di notifica ---
    const body =
      "Nuovo lead dal sito Chinaglia SRL\n" +
      "------------------------------------------\n" +
      "Nome e cognome : " + (p.nome || "-") + "\n" +
      "Struttura      : " + (p.struttura || "-") + "\n" +
      "Tipo struttura : " + (p.tipo_struttura || "-") + "\n" +
      "Città          : " + (p.citta || "-") + "\n" +
      "Telefono       : " + (p.telefono || "-") + "\n" +
      "Email          : " + (p.email || "-") + "\n" +
      "Strumenti usati: " + (p.strumenti || "-") + "\n" +
      "Attività manuale che fa perdere più tempo:\n  " + (p.attivita_manuale || "-") + "\n" +
      "Fascia oraria  : " + (p.fascia_oraria || "-") + "\n" +
      "------------------------------------------\n" +
      "Ricevuto il " + Utilities.formatDate(now, Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm");

    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: SUBJECT,
      body: body,
      replyTo: p.email || NOTIFY_EMAIL,
      name: "Sito Chinaglia SRL"
    });

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/** Verifica rapida: aprendo l'URL /exec nel browser deve rispondere OK. */
function doGet() {
  return ContentService.createTextOutput("Chinaglia SRL — endpoint lead attivo.");
}

/** Eseguila UNA volta dall'editor per autorizzare i permessi (Gmail + Fogli). */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
    sh.setFrozenRows(1);
  }
  MailApp.sendEmail(NOTIFY_EMAIL, SUBJECT + " (test)", "Test di configurazione riuscito. L'endpoint è pronto.");
}
