/* Farm 2 Families Giving Gallop — site scripts */

// ==== CONFIG ====
const SHEET_ENDPOINT = "https://script.google.com/macros/s/AKfycbxEpLfZrQSwn9vSHVGyXZXKDc48e3O_crZmAu-5WH4P-zIlXyi4rK2Rm3EjeP6VzHYG/exec";
const DONATE_URL = "https://secure.childrenshospital.org/site/Donation2?PROXY_ID=3205208&5972.donation=form1&mfc_pref=T&idb=248897034&df_id=5972&PROXY_TYPE=20&FR_ID=2760&s_src=EVG26GS020000&s_src_date=2026-10-05&s_subsrc=g:1frmefy,b:4hrl42&lo_source=EVG26GS020000&lo_subsource=g:1frmefy,b:4hrl42&utm_id=EVG26GS020000&utm_source=AG&utm_medium=Search&utm_campaign=EVG&utm_content=GS0";

// Point every Donate link at the real donation page
document.querySelectorAll('a[data-donate]').forEach((a) => { a.href = DONATE_URL; a.target = "_blank"; a.rel = "noopener"; });

// Send a record to the Google Sheet. Google answers with a redirect the browser
// can't read, so we fire and move on after a short wait instead of hanging.
function sendToSheet(payload) {
  if (!SHEET_ENDPOINT.startsWith("http")) { console.warn("SHEET_ENDPOINT not set"); return Promise.resolve(); }
  const body = JSON.stringify({ ...payload, submittedAt: new Date().toISOString(), userAgent: navigator.userAgent });
  const req = fetch(SHEET_ENDPOINT, { method: "POST", mode: "no-cors", keepalive: true, headers: { "Content-Type": "text/plain" }, body }).catch(() => {});
  const wait = new Promise((r) => setTimeout(r, 1500));
  return Promise.race([req, wait]);
}

// Mobile nav
const toggle = document.querySelector(".nav-toggle");
const links = document.querySelector(".nav-links");
if (toggle && links) {
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
}

// Course: runners / walkers toggle
const segs = document.querySelectorAll(".seg");
if (segs.length) {
  const show = (mode) => {
    segs.forEach((s) => s.setAttribute("aria-pressed", s.dataset.mode === mode ? "true" : "false"));
    document.querySelectorAll("[data-for]").forEach((el) => { el.hidden = el.dataset.for !== mode && el.dataset.for !== "both"; });
  };
  segs.forEach((s) => s.addEventListener("click", () => show(s.dataset.mode)));
  show("run");
}

// ===== Sign-up: two-step flow =====
const form = document.getElementById("signup-form");
if (form) {
  const amountInput = form.querySelector("#amount");
  const amtButtons = form.querySelectorAll(".amt");
  const errBox = form.querySelector("#form-error");
  const submitBtn = form.querySelector("button[type=submit]");
  const step1 = document.getElementById("step-1");
  const step2 = document.getElementById("step-2");
  const confirm = document.getElementById("signup-done");
  const gallopers = []; // everyone registered in this session

  const syncButtons = () => amtButtons.forEach((b) => b.setAttribute("aria-pressed", Number(b.dataset.amount) === Number(amountInput.value) ? "true" : "false"));
  amtButtons.forEach((b) => b.addEventListener("click", () => { amountInput.value = b.dataset.amount; syncButtons(); errBox.hidden = true; }));
  amountInput.addEventListener("input", syncButtons);
  syncButtons();

  const setStep = (n, state) => { // state: "active" | "done" | "todo"
    const el = document.querySelector(`.step-head[data-step="${n}"]`);
    if (el) el.dataset.state = state;
  };
  const fail = (msg) => { errBox.textContent = msg; errBox.hidden = false; errBox.focus(); };
  const scrollTo = (el) => el.scrollIntoView({ behavior: "smooth", block: "start" });

  const cheers = [
    "Santa has been notified.",
    "The reindeer are stretching already.",
    "Go find your ugliest sweater.",
    "Antlers are optional. Encouraged, but optional.",
    "Robbins Farm is going to be a little more festive now."
  ];

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errBox.hidden = true;
    const data = Object.fromEntries(new FormData(form).entries());
    data.amount = Number(data.amount);
    data.agreed = form.querySelector("#agree").checked;
    if (!data.firstName.trim() || !data.lastName.trim()) return fail("We need your first and last name.");
    if (!/.+@.+\..+/.test(data.email)) return fail("Please enter a valid email.");
    if (!(data.amount >= 25)) return fail("Ho ho no: the minimum is $25 in gift cards.");
    if (!data.agreed || !data.signature.trim()) return fail("Please agree to the waiver and type your name to sign.");

    submitBtn.disabled = true; submitBtn.textContent = "Saving your spot…";
    await sendToSheet({ type: "signup", ...data });
    gallopers.push(data);

    // Confirmation
    confirm.querySelector("[data-first]").textContent = data.firstName.trim();
    confirm.querySelector("[data-amount]").textContent = "$" + data.amount;
    confirm.querySelector("[data-cheer]").textContent = cheers[(gallopers.length - 1) % cheers.length];
    const list = confirm.querySelector("[data-list]");
    list.innerHTML = gallopers.map((g) => `<li>${g.firstName.trim()} ${g.lastName.trim()} · $${g.amount} in gift cards</li>`).join("");
    form.hidden = true; confirm.hidden = false;
    scrollTo(step1);
    submitBtn.disabled = false; submitBtn.textContent = "Count me in!";
  });

  // Register another galloper → back to a fresh form
  document.getElementById("add-another").addEventListener("click", () => {
    const keepEmail = form.querySelector("#email").value;
    form.reset();
    form.querySelector("#email").value = keepEmail; // same household, likely same email
    amountInput.value = 25; syncButtons();
    confirm.hidden = true; form.hidden = false;
    scrollTo(step1);
    form.querySelector("#firstName").focus();
  });

  // Proceed to step 2
  document.getElementById("to-step-2").addEventListener("click", () => {
    setStep(1, "done"); setStep(2, "active");
    step1.classList.add("collapsed");
    step2.hidden = false;
    step2.querySelector("[data-count]").textContent = gallopers.length === 1 ? "you" : `all ${gallopers.length} of you`;
    scrollTo(step2);
  });

  // Donate button: opens Boston Children's in a new tab and reveals the "I donated" check-in
  document.getElementById("donate-now").addEventListener("click", () => {
    document.getElementById("donated-check").hidden = false;
  });

  // Honor-system completion of step 2
  document.getElementById("i-donated").addEventListener("click", async (ev) => {
    const btn = ev.currentTarget;
    btn.disabled = true; btn.textContent = "Saving…";
    const who = gallopers[gallopers.length - 1] || {};
    await sendToSheet({ type: "donation", firstName: who.firstName, lastName: who.lastName, email: who.email, gallopers: gallopers.length });
    setStep(2, "done");
    document.getElementById("step-2-form").hidden = true;
    document.getElementById("all-done").hidden = false;
    scrollTo(step2);
  });
}
