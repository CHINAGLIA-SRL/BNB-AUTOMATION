# Chinaglia SRL — Landing page (produzione)

Cartella pronta per la pubblicazione su **Vercel**. È un sito **statico** (HTML/CSS/JS), senza build: si carica e basta.

## File contenuti
```
production/
├── index.html              ← pagina principale
├── styles.css              ← stili
├── app.js                  ← logica + CONFIGURAZIONE (contatti, form, immagini)
├── google-apps-script.gs   ← endpoint del modulo (email + riga su foglio)
├── favicon.svg             ← icona del sito
├── robots.txt              ← indicizzazione motori di ricerca
└── vercel.json             ← cache + clean URLs (opzionale ma consigliato)
```

> Nota: la pagina di produzione **non** include il pannello "Tweaks" usato in fase di
> design, né React/Babel. È più leggera e veloce. Lo stile predefinito (diagramma
> hero, accento teal, font Space Grotesk) è già impostato.

---

## ⚙️ Prima di pubblicare — modifica SOLO `app.js`

In cima ad `app.js` c'è un unico blocco `CONFIG`. Sostituisci i placeholder:

```js
const CONFIG = {
  phone:    "+39 351 939 9451",
  whatsapp: "39 351 939 9451",
  email:    "info@chinagliafederico.com",
  calendly: "https://calendly.com/chinagliasrl/consulenza-gratuita",

  // URL dell'endpoint del modulo (vedi sotto: Google Apps Script)
  FORM_ENDPOINT: "https://script.google.com/macros/s/INCOLLA_QUI_IL_TUO_ID/exec",
  FORM_SUBJECT:  "New Lead - BNB Automation",
  FORM_MODE:     "form",   // "form" per Apps Script/Web3Forms · "json" per Formspree/webhook

  // IMPORTANTE: metti false quando hai incollato il tuo FORM_ENDPOINT reale
  PROTOTYPE_MODE: true,

  // Foto: sostituisci le URL con le tue immagini reali quando vuoi
  IMAGES: { ... }
};
```

- **Contatti** → già impostati (telefono/WhatsApp `+39 351 939 9451`, email `info@chinagliafederico.com`)
- **Modulo** → vedi la sezione qui sotto, poi imposta `PROTOTYPE_MODE: false`
- **Immagini** → opzionale, sostituisci le URL in `IMAGES`

---

## 📩 Modulo → Email + riga su foglio (Google Apps Script)

Ad ogni invio del modulo arriva **un'email** a `info@chinagliafederico.com`
(oggetto **"New Lead - BNB Automation"**) **e** viene aggiunta **una riga** a un
foglio Google con tutti i dati. Il foglio si esporta in Excel quando vuoi
(`File → Scarica → Microsoft Excel .xlsx`). Tutto gratis, senza server.

**Attivazione (≈5 min):**
1. Crea un nuovo foglio su [sheets.google.com](https://sheets.google.com).
2. **Estensioni → Apps Script**, incolla il contenuto di `google-apps-script.gs`.
3. Esegui una volta la funzione **`setup`** per autorizzare i permessi (Gmail + Fogli).
4. **Deploy → Nuova distribuzione → App web** → *Esegui come: Me stesso* · *Accesso: Chiunque* → **Distribuisci**.
5. Copia l'URL che termina con `/exec`.
6. In `app.js` incolla l'URL in `FORM_ENDPOINT` e imposta `PROTOTYPE_MODE: false`.

> Le istruzioni dettagliate sono anche in cima al file `google-apps-script.gs`.

**Preferisci un altro servizio?** In `app.js`:
- **Formspree / webhook Make / Zapier / CRM** → imposta `FORM_MODE: "json"` e incolla l'URL in `FORM_ENDPOINT`.
- **Web3Forms** → lascia `FORM_MODE: "form"` e usa l'URL/access key del servizio.
- Per **Microsoft Excel/OneDrive** nativo si può usare un flusso **Power Automate** ("quando arriva una richiesta HTTP → aggiungi riga in Excel + invia email"): imposta `FORM_MODE: "json"` e incolla l'URL del flusso.

---

## 🚀 Pubblicazione su Vercel

### Opzione A — Trascina la cartella (più rapida)
1. Vai su **vercel.com** → accedi.
2. **Add New → Project → Deploy** (oppure usa il drag-and-drop su vercel.com/new).
3. Trascina **il contenuto** di questa cartella `production/` (non la cartella stessa, ma i file al suo interno: `index.html`, `styles.css`, ecc.).
4. Vercel rileva automaticamente un sito statico → **Deploy**. Fatto.

### Opzione B — Da terminale (Vercel CLI)
```bash
npm i -g vercel        # solo la prima volta
cd production
vercel                 # anteprima
vercel --prod          # pubblicazione definitiva
```

### Opzione C — Da GitHub
1. Carica i file di `production/` in un repository GitHub.
2. Su Vercel: **Add New → Project → Import** il repository.
3. Nessun "build command" e nessuna "output directory" (lascia vuoto / Framework: **Other**).
4. **Deploy**.

---

## 🌐 Dominio personalizzato
Su Vercel: **Project → Settings → Domains → Add** e segui le istruzioni DNS
(es. `chinagliasrl.it`).

## ✅ Checklist rapida
- [x] Contatti reali inseriti in `CONFIG` (telefono/WhatsApp + email)
- [ ] Foglio Google + Apps Script attivati e `/exec` incollato in `FORM_ENDPOINT`
- [ ] `PROTOTYPE_MODE: false`
- [ ] Inviato un test dal modulo → email ricevuta + riga aggiunta al foglio
- [ ] (Opzionale) Foto sostituite in `IMAGES`
- [ ] Dominio personalizzato collegato
