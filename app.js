/* Sawyer's Squishys — events rendering + contact form */
(function () {
  "use strict";

  /* ============ CONFIG ============ */
  // Public Web3Forms access key. Safe to expose: it only accepts submissions,
  // it does not reveal the destination inbox.
  var ACCESS_KEY = "9f01d209-7823-4032-a2e1-1a385da6b2f3";
  var ENDPOINT = "https://api.web3forms.com/submit";
  var SUBJECT = "Sawyer's Squishys website message";

  /* ============ EVENTS ============ */
  var listEl = document.getElementById("events-list");

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // Parse YYYY-MM-DD (or anything Date understands) as a LOCAL date at midnight,
  // so an event doesn't vanish because of a timezone shift.
  function parseDate(v) {
    if (!v) return null;
    var s = String(v).trim();
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
    if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
    var d = new Date(s);
    return isNaN(d.getTime()) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  // The last day the event is relevant (hide only after it has fully passed).
  function endDate(ev) {
    var cands = [ev.end, ev.endDate, ev.date, ev.start, ev.startDate];
    if (Array.isArray(ev.dates) && ev.dates.length) cands = ev.dates.concat(cands);
    var best = null;
    for (var i = 0; i < cands.length; i++) {
      var d = parseDate(cands[i]);
      if (d && (!best || d > best)) best = d;
    }
    return best;
  }

  function startDate(ev) {
    var cands = [ev.start, ev.startDate, ev.date];
    if (Array.isArray(ev.dates) && ev.dates.length) cands = [ev.dates[0]].concat(cands);
    for (var i = 0; i < cands.length; i++) {
      var d = parseDate(cands[i]);
      if (d) return d;
    }
    return endDate(ev);
  }

  var FMT = { weekday: "short", month: "long", day: "numeric", year: "numeric" };
  function fmt(d) {
    try { return d.toLocaleDateString(undefined, FMT); }
    catch (e) { return d.toDateString(); }
  }

  function dateLabel(ev) {
    // Explicit free-text wins if the author wrote one.
    if (ev.dateText) return esc(ev.dateText);

    if (Array.isArray(ev.dates) && ev.dates.length) {
      var ds = ev.dates.map(parseDate).filter(Boolean).sort(function (a, b) { return a - b; });
      if (ds.length > 1) return esc(fmt(ds[0]) + " – " + fmt(ds[ds.length - 1]));
      if (ds.length === 1) return esc(fmt(ds[0]));
    }
    var s = startDate(ev), e = endDate(ev);
    if (s && e && s.getTime() !== e.getTime()) return esc(fmt(s) + " – " + fmt(e));
    if (s) return esc(fmt(s));
    return esc(ev.date || "");
  }

  function daysUntil(d) {
    var today = new Date(); today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return Math.round((d - today) / 86400000);
  }

  function badgeFor(ev) {
    var s = startDate(ev), e = endDate(ev);
    if (!s) return "";
    var today = new Date(); today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (s <= today && e >= today) return '<span class="badge">Happening now</span>';
    var n = daysUntil(s);
    if (n === 1) return '<span class="badge soon">Tomorrow!</span>';
    if (n > 1 && n <= 7) return '<span class="badge soon">This week</span>';
    return "";
  }

  function row(icon, label, value) {
    if (!value) return "";
    return '<li><span class="ico" aria-hidden="true">' + icon + "</span>" +
           '<span><span class="sr-only">' + label + ": </span>" + esc(value) + "</span></li>";
  }

  function emptyState() {
    return '<div class="empty-state">' +
      '<div class="big" aria-hidden="true">🫧</div>' +
      "<p>Events coming soon — follow along!</p>" +
      '<p class="sub">Check back here for the next festival or market.</p>' +
      "</div>";
  }

  function render(events) {
    listEl.setAttribute("aria-busy", "false");

    if (!Array.isArray(events)) events = [];

    var today = new Date();
    today = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    var upcoming = events.filter(function (ev) {
      if (!ev || typeof ev !== "object") return false;
      var e = endDate(ev);
      return e ? e >= today : true; // keep undated entries visible
    }).sort(function (a, b) {
      var x = startDate(a), y = startDate(b);
      if (!x) return 1;
      if (!y) return -1;
      return x - y;
    });

    if (!upcoming.length) { listEl.innerHTML = emptyState(); return; }

    listEl.innerHTML = upcoming.map(function (ev) {
      return '<article class="event-card">' +
        "<h3>" + esc(ev.name || "Event") + badgeFor(ev) + "</h3>" +
        '<ul class="event-meta">' +
          row("📅", "Date", dateLabel(ev)) +
          row("📍", "Location", ev.location) +
          row("🕒", "Hours", ev.hours) +
          row("🎪", "Booth", ev.booth) +
        "</ul>" +
        (ev.notes ? '<p class="event-notes">' + esc(ev.notes) + "</p>" : "") +
        "</article>";
    }).join("");
  }

  fetch("events.json", { cache: "no-cache" })
    .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
    .then(render)
    .catch(function () { render([]); });

  /* ============ CONTACT FORM ============ */
  var form = document.getElementById("contact-form");
  var statusEl = document.getElementById("form-status");
  var btn = document.getElementById("submit-btn");

  function setStatus(msg, cls) {
    statusEl.textContent = msg;
    statusEl.className = "form-status" + (cls ? " " + cls : "");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var name = form.name.value.trim();
    var email = form.email.value.trim();
    var message = form.message.value.trim();

    [form.name, form.email, form.message].forEach(function (f) { f.removeAttribute("aria-invalid"); });

    var bad = null;
    if (!name) bad = [form.name, "Please tell me your name."];
    else if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) bad = [form.email, "Please enter a valid email address."];
    else if (!message) bad = [form.message, "Please write a short message."];

    if (bad) {
      bad[0].setAttribute("aria-invalid", "true");
      bad[0].focus();
      setStatus(bad[1], "err");
      return;
    }

    // honeypot
    if (form.botcheck && form.botcheck.checked) return;

    btn.disabled = true;
    setStatus("Sending…", "busy");

    // Use FormData (not JSON) so the request stays a CORS "simple request"
    // and no preflight is needed — api.web3forms.com rejects OPTIONS preflights.
    var fd = new FormData();
    fd.append("access_key", ACCESS_KEY);
    fd.append("subject", SUBJECT);
    fd.append("from_name", "Sawyer's Squishys Website");
    fd.append("name", name);
    fd.append("email", email);
    fd.append("message", message);

    fetch(ENDPOINT, { method: "POST", body: fd })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (res.ok && res.j && res.j.success) {
          form.reset();
          setStatus("Thanks " + name.split(" ")[0] + "! Your message is on its way. 🫧", "ok");
        } else {
          setStatus((res.j && res.j.message) || "Something went wrong. Please try again.", "err");
        }
      })
      .catch(function () {
        setStatus("Network error — please check your connection and try again.", "err");
      })
      .then(function () { btn.disabled = false; });
  });
})();
