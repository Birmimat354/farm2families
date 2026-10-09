/* Farm 2 Families Giving Gallop — site scripts */

// ==== CONFIG: paste your Google Apps Script web app URL here (see README) ====
   const SHEET_ENDPOINT = "https://script.google.com/macros/s/AKfycbxEpLfZrQSwn9vSHVGyXZXKDc48e3O_crZmAu-5WH4P-zIlXyi4rK2Rm3EjeP6VzHYG/exec";

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
    document.querySelectorAll("[data-for]").forEach((el) => {
      el.hidden = el.dataset.for !== mode && el.dataset.for !== "both";
    });
  };
  segs.forEach((s) => s.addEventListener("click", () => show(s.dataset.mode)));
  show("run");
}

// Sign-up form
const form = document.getElementById("signup-form");
if (form) {
  const amountInput = form.querySelector("#amount");
  const amtButtons = form.querySelectorAll(".amt");
  const errBox = form.querySelector("#form-error");
  const syncButtons = () => {
    amtButtons.forEach((b) => b.setAttribute("aria-pressed", Number(b.dataset.amount) === Number(amountInput.value) ? "true" : "false"));
  };
  amtButtons.forEach((b) => b.addEventListener("click", () => { amountInput.value = b.dataset.amount; syncButtons(); errBox.hidden = true; }));
  amountInput.addEventListener("input", syncButtons);
  syncButtons();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errBox.hidden = true;
    const data = Object.fromEntries(new FormData(form).entries());
    data.amount = Number(data.amount);
    data.agreed = form.querySelector("#agree").checked;

    const fail = (msg) => { errBox.textContent = msg; errBox.hidden = false; errBox.focus(); };
    if (!data.firstName.trim() || !data.lastName.trim()) return fail("We need your first and last name.");
    if (!/.+@.+\..+/.test(data.email)) return fail("Please enter a valid email.");
    if (!(data.amount >= 25)) return fail("Ho ho no: the minimum is $25 in gift cards.");
    if (!data.agreed || !data.signature.trim()) return fail("Please agree to the waiver and type your name to sign.");

    const btn = form.querySelector("button[type=submit]");
    btn.disabled = true; btn.textContent = "Sending…";
    try {
      if (SHEET_ENDPOINT.startsWith("http")) {
        await fetch(SHEET_ENDPOINT, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain" },
          body: JSON.stringify({ ...data, submittedAt: new Date().toISOString(), userAgent: navigator.userAgent })
        });
      } else {
        console.warn("SHEET_ENDPOINT not set — sign-up was not recorded.");
      }
      form.hidden = true;
      const done = document.getElementById("signup-done");
      done.querySelector("[data-first]").textContent = data.firstName.trim();
      done.querySelector("[data-amount]").textContent = "$" + data.amount;
      done.querySelector("[data-email]").textContent = data.email.trim();
      done.hidden = false;
      done.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (err) {
      btn.disabled = false; btn.textContent = "Count me in!";
      fail("Something went wrong sending your sign-up. Please try again, or email us.");
    }
  });
}
