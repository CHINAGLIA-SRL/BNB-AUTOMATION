/* ==========================================================================
   Chinaglia SRL — landing page logic
   ==========================================================================
   ┌─────────────────────────────────────────────────────────────────────┐
   │  CONFIGURAZIONE — modifica SOLO questo blocco per andare in produzione │
   └─────────────────────────────────────────────────────────────────────┘
*/
const CONFIG = {
  // --- Contatti ---
  phone:    "+39 351 939 9451",        // mostrato e usato per il link tel:
  whatsapp: "39 351 939 9451",         // numero WhatsApp (gli spazi vengono ripuliti automaticamente)
  email:    "info@chinagliafederico.com",
  calendly: "https://calendly.com/chinagliasrl/consulenza-gratuita",

  // --- Invio del modulo ---
  // L'endpoint consigliato è un "Web App" di Google Apps Script: invia l'email di
  // notifica E aggiunge una riga al foglio Google (esportabile in Excel) in un colpo solo.
  // 1) Crea il foglio + lo script (vedi google-apps-script.gs e il README).
  // 2) Pubblica come Web App e incolla qui sotto l'URL che finisce con /exec.
  FORM_ENDPOINT: "https://script.google.com/macros/s/AKfycbwE4BRKekTuj68VaRXUlWV8fA9J8PM_kByFXuBVJVRKSX-e4A2p6dAxgRbvO3r0kt9p/exec",

  // L'email arriva con questo oggetto. (Per Apps Script l'oggetto è impostato anche
  // nello script lato server; questo valore viene comunque inviato come campo _subject.)
  FORM_SUBJECT: "New Lead - BNB Automation",

  // Modalità di invio:
  //  "form" = POST form-encoded (Google Apps Script / Web3Forms) — CONSIGLIATA
  //  "json" = POST JSON (Formspree, webhook Make/Zapier, CRM/backend personalizzati)
  FORM_MODE: "form",

  // Modalità prototipo: true = NON invia davvero, mostra solo il messaggio di successo.
  // IMPORTANTE: imposta a false quando hai incollato il tuo FORM_ENDPOINT reale qui sopra.
  PROTOTYPE_MODE: false,

  // --- Immagini stock (placeholder Unsplash) ---
  // Sostituisci liberamente questi URL con le tue foto reali. Se un'immagine non
  // carica, al suo posto compare automaticamente un placeholder elegante.
  // Suggerimento: mantieni i parametri ?auto=format&fit=crop&w=...&q=70 per le prestazioni.
  IMAGES: {
    heroHospitality: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=900&q=75",   // hero variante "Foto + workflow"
    problemMain:     "https://images.unsplash.com/photo-1556745757-8d76bdb6984b?auto=format&fit=crop&w=800&q=70",   // reception / lavoro manuale al desk
    problemSub:      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=70", // più strumenti, fogli, laptop
    positioning:     "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=70", // gestionale aperto + lavoro manuale
    process:         "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1100&q=70", // consulenza / audit dei processi
    contact:         "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=70", // reception / ambiente curato
    trust:           "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=70"  // struttura ordinata, approccio locale
  }
};
/* ───────────────────────── fine configurazione ───────────────────────── */

(function () {
  "use strict";

  /* ---- 0. Applica la configurazione contatti agli elementi ---- */
  const telHref = "tel:" + CONFIG.phone.replace(/[^\d+]/g, "");
  const waHref  = "https://wa.me/" + CONFIG.whatsapp.replace(/[^\d]/g, "");
  const linkMap = {
    phone: telHref,
    whatsapp: waHref,
    email: "mailto:" + CONFIG.email,
    calendly: CONFIG.calendly
  };
  document.querySelectorAll("[data-link]").forEach((el) => {
    const key = el.getAttribute("data-link");
    if (linkMap[key]) {
      el.setAttribute("href", linkMap[key]);
      if (key === "calendly" || key === "whatsapp") {
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noopener");
      }
    }
  });
  document.querySelectorAll("[data-cfg]").forEach((el) => {
    const key = el.getAttribute("data-cfg");
    if (CONFIG[key]) el.textContent = CONFIG[key];
  });
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- 0b. Immagini: assegna le URL dalla config, poi gestisci il fallback ---- */
  document.querySelectorAll("[data-img]").forEach((img) => {
    const key = img.getAttribute("data-img");
    if (CONFIG.IMAGES && CONFIG.IMAGES[key]) img.src = CONFIG.IMAGES[key];
  });
  document.querySelectorAll(".media img").forEach((img) => {
    const fail = () => img.closest(".media").classList.add("failed");
    if (img.complete && img.naturalWidth === 0 && img.src) fail();
    img.addEventListener("error", fail);
    img.addEventListener("load", () => { if (img.naturalWidth > 0) img.closest(".media").classList.remove("failed"); });
  });

  /* ---- 1. Sticky header state ---- */
  const header = document.querySelector(".site-header");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 12);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- 2. Mobile drawer ---- */
  const drawer = document.getElementById("mobile-drawer");
  const hamburger = document.getElementById("hamburger");
  const openDrawer = () => { drawer.classList.add("open"); hamburger.setAttribute("aria-expanded", "true"); document.body.style.overflow = "hidden"; };
  const closeDrawer = () => { drawer.classList.remove("open"); hamburger.setAttribute("aria-expanded", "false"); document.body.style.overflow = ""; };
  hamburger.addEventListener("click", openDrawer);
  drawer.querySelectorAll("[data-close]").forEach((el) => el.addEventListener("click", closeDrawer));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDrawer(); });

  /* ---- 3. Smooth scroll for in-page anchors (with sticky-header offset) ---- */
  const HEADER_OFFSET = 88;
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
      window.scrollTo({ top: y, behavior: "smooth" });
    });
  });

  /* ---- 4. FAQ accordion ---- */
  document.querySelectorAll(".faq-item").forEach((item) => {
    const btn = item.querySelector(".faq-q");
    btn.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      // close others for a clean single-open accordion
      document.querySelectorAll(".faq-item.open").forEach((other) => {
        if (other !== item) { other.classList.remove("open"); other.querySelector(".faq-q").setAttribute("aria-expanded", "false"); }
      });
      item.classList.toggle("open", !isOpen);
      btn.setAttribute("aria-expanded", String(!isOpen));
    });
  });

  /* ---- 5. Mobile sticky CTA: show after hero, hide near the form ---- */
  const mobileCta = document.getElementById("mobile-cta");
  const contactSection = document.getElementById("contatti");
  const heroSection = document.querySelector(".hero");
  const ctaObserver = () => {
    const pastHero = window.scrollY > (heroSection ? heroSection.offsetHeight - 120 : 400);
    const contactTop = contactSection.getBoundingClientRect().top;
    const nearForm = contactTop < window.innerHeight * 0.9;
    mobileCta.classList.toggle("show", pastHero && !nearForm);
  };
  ctaObserver();
  window.addEventListener("scroll", ctaObserver, { passive: true });

  /* ---- 6. Reveal on scroll ---- */
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
  } else {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("in"));
  }

  /* ---- 7. Form: validation + submit (prototype + real-endpoint ready) ---- */
  const form = document.getElementById("lead-form");
  const formCard = document.getElementById("form-card");
  const formError = document.getElementById("form-error");

  const setInvalid = (field, bad) => field.classList.toggle("invalid", bad);
  const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  function validate() {
    let valid = true;
    form.querySelectorAll("[required]").forEach((input) => {
      const field = input.closest(".field");
      let bad = !input.value.trim();
      if (!bad && input.type === "email") bad = !emailOk(input.value.trim());
      setInvalid(field, bad);
      if (bad && valid) input.focus();
      if (bad) valid = false;
    });
    return valid;
  }

  // live-clear errors
  form.querySelectorAll("input, select, textarea").forEach((input) => {
    input.addEventListener("input", () => { const f = input.closest(".field"); if (f) f.classList.remove("invalid"); });
    input.addEventListener("change", () => { const f = input.closest(".field"); if (f) f.classList.remove("invalid"); });
  });

  function showSuccess() {
    formCard.classList.add("sent");
    formCard.scrollIntoView ? null : null; // avoid scrollIntoView per guidelines
    const y = formCard.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
    window.scrollTo({ top: y, behavior: "smooth" });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // prototype mode: always prevent default
    formError.style.display = "none";
    if (!validate()) return;

    const submitBtn = form.querySelector(".form-submit");
    const original = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Invio in corso…";

    // PROTOTYPE: simulate a successful submission
    if (CONFIG.PROTOTYPE_MODE) {
      setTimeout(() => { submitBtn.disabled = false; submitBtn.textContent = original; showSuccess(); }, 700);
      return;
    }

    // REAL ENDPOINT
    const data = Object.fromEntries(new FormData(form).entries());
    data._subject = CONFIG.FORM_SUBJECT;            // oggetto email (Web3Forms / Apps Script)
    data.subject  = CONFIG.FORM_SUBJECT;            // alias compatibile
    data._inviato_il = new Date().toLocaleString("it-IT");

    try {
      if (CONFIG.FORM_MODE === "json") {
        // Formspree / webhook Make-Zapier / CRM / backend personalizzato
        const res = await fetch(CONFIG.FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error("Bad response " + res.status);
      } else {
        // "form": POST form-encoded per Google Apps Script / Web3Forms.
        // Apps Script non espone header CORS, quindi usiamo mode:"no-cors":
        // la richiesta parte (email + riga foglio), la risposta è opaca → la
        // consideriamo riuscita se il fetch non genera un errore di rete.
        await fetch(CONFIG.FORM_ENDPOINT, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
          body: new URLSearchParams(data).toString()
        });
      }
      showSuccess();
    } catch (err) {
      formError.style.display = "block";
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = original;
    }
  });

  /* ---- 8. Hero diagram connectors (variant 1 only) ---- */
  const svg = document.getElementById("connector-svg");
  const stage = document.getElementById("diagram-stage");

  function drawConnectors() {
    if (!svg || !stage) return;
    if (document.body.getAttribute("data-hero-variant") !== "diagramma") return;
    const stageRect = stage.getBoundingClientRect();
    if (stageRect.width === 0) return;
    const hub = stage.querySelector('[data-node="h"]');
    if (!hub) return;
    const hubRect = hub.getBoundingClientRect();
    const hubL = { x: hubRect.left - stageRect.left, y: hubRect.top - stageRect.top + hubRect.height / 2 };
    const hubR = { x: hubRect.right - stageRect.left, y: hubRect.top - stageRect.top + hubRect.height / 2 };

    let paths = "";
    const curve = (x1, y1, x2, y2, cls) => {
      const mx = (x1 + x2) / 2;
      return `<path class="${cls}" d="M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}"/>`;
    };

    stage.querySelectorAll('[data-node="s"]').forEach((n, i) => {
      const r = n.getBoundingClientRect();
      const x = r.right - stageRect.left, y = r.top - stageRect.top + r.height / 2;
      paths += curve(x, y, hubL.x, hubL.y, "base");
      paths += curve(x, y, hubL.x, hubL.y, "flow");
    });
    stage.querySelectorAll('[data-node="o"]').forEach((n, i) => {
      const r = n.getBoundingClientRect();
      const x = r.left - stageRect.left, y = r.top - stageRect.top + r.height / 2;
      paths += curve(hubR.x, hubR.y, x, y, "base");
      paths += curve(hubR.x, hubR.y, x, y, "flow");
    });

    svg.innerHTML =
      '<defs><linearGradient id="flowgrad2" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#45c9bf"/><stop offset="1" stop-color="#C6922B"/></linearGradient></defs>' +
      paths.replace(/url\(#flowgrad\)/g, "url(#flowgrad2)");
    // ensure flow gradient ref resolves (CSS uses #flowgrad in sprite; reuse here)
    svg.querySelectorAll(".flow").forEach((p) => p.setAttribute("stroke", "url(#flowgrad2)"));
  }

  // redraw on load, resize, font load, and variant change
  window.addEventListener("load", drawConnectors);
  window.addEventListener("resize", () => { clearTimeout(window.__rc); window.__rc = setTimeout(drawConnectors, 120); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawConnectors);
  setTimeout(drawConnectors, 300);

  // expose for tweaks panel to trigger after switching hero variant
  window.__drawHeroConnectors = drawConnectors;
})();
