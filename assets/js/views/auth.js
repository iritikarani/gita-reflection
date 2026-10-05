import { esc, icon, toast } from "../ui.js";
import * as store from "../store.js";
import { afterAuth } from "../app.js";

function field({ id, label, type = "text", autocomplete, value = "", hint }) {
  const isPw = type === "password";
  return `
    <div class="field">
      <label for="${id}">${esc(label)}</label>
      <div class="input-wrap">
        <input id="${id}" name="${id}" type="${type}" autocomplete="${autocomplete}" value="${esc(value)}" ${hint ? `aria-describedby="${id}-hint"` : ""} required>
        ${isPw ? `<button class="pw-toggle" type="button" data-toggle="${id}" aria-label="Show password" aria-pressed="false">Show</button>` : ""}
      </div>
      ${hint ? `<p class="fine" id="${id}-hint">${esc(hint)}</p>` : ""}
    </div>`;
}

const DEVICE_NOTE = "Your account and reflections are stored privately in this browser, on this device.";

export function render(root, { mode, query }) {
  const next = query.next || "";
  const nextQ = next ? `?next=${encodeURIComponent(next)}` : "";

  if (store.currentUser() && mode !== "forgot") {
    root.innerHTML = `<section class="wrap narrow page-pad center"><h1>You're already logged in</h1><p class="lead">Welcome back.</p><a class="btn btn-primary" href="#/journey">Go to My Journey</a></section>`;
    return;
  }

  const content = {
    signup: {
      title: "Create your free account",
      lead: "Save reflections, keep your place in guided journeys, and return to your history whenever you need.",
      form: `
        ${field({ id: "name", label: "What should we call you?", autocomplete: "given-name" })}
        ${field({ id: "email", label: "Email", type: "email", autocomplete: "email" })}
        ${field({ id: "password", label: "Password", type: "password", autocomplete: "new-password", hint: "At least 8 characters." })}
        <button class="btn btn-primary btn-block" type="submit">Create account</button>`,
      foot: `Already have an account? <a href="#/login${nextQ}">Log in</a>`
    },
    login: {
      title: "Welcome back",
      lead: "Log in to see your reflections and continue your journey.",
      form: `
        ${field({ id: "email", label: "Email", type: "email", autocomplete: "email" })}
        ${field({ id: "password", label: "Password", type: "password", autocomplete: "current-password" })}
        <p class="right"><a href="#/forgot${nextQ}">Forgot password?</a></p>
        <button class="btn btn-primary btn-block" type="submit">Log in</button>`,
      foot: `New here? <a href="#/signup${nextQ}">Create a free account</a>`
    },
    forgot: {
      title: "Reset your password",
      lead: "Enter the email you signed up with.",
      form: `
        ${field({ id: "email", label: "Email", type: "email", autocomplete: "email" })}
        <div class="reset-step" hidden>
          ${field({ id: "password", label: "New password", type: "password", autocomplete: "new-password", hint: "At least 8 characters." })}
        </div>
        <button class="btn btn-primary btn-block" type="submit">Continue</button>`,
      foot: `Remembered it? <a href="#/login${nextQ}">Log in</a>`
    }
  }[mode];

  root.innerHTML = `
  <section class="auth wrap">
    <div class="auth-card">
      <h1>${esc(content.title)}</h1>
      <p class="muted">${esc(content.lead)}</p>
      <form id="auth-form" novalidate>
        <div class="form-error" role="alert" aria-live="assertive"></div>
        ${content.form}
      </form>
      <p class="auth-foot">${content.foot}</p>
      <p class="fine center">${icon("lock")} ${esc(DEVICE_NOTE)}</p>
    </div>
  </section>`;

  const form = root.querySelector("#auth-form");
  const error = root.querySelector(".form-error");
  const submit = form.querySelector('button[type="submit"]');

  form.addEventListener("click", e => {
    const t = e.target.closest("[data-toggle]");
    if (!t) return;
    const input = form.querySelector(`#${t.dataset.toggle}`);
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    t.textContent = show ? "Hide" : "Show";
    t.setAttribute("aria-pressed", String(show));
    t.setAttribute("aria-label", show ? "Hide password" : "Show password");
  });

  let resetReady = false;

  form.addEventListener("submit", async e => {
    e.preventDefault();
    error.textContent = "";
    form.querySelectorAll("[aria-invalid]").forEach(i => i.removeAttribute("aria-invalid"));
    const val = id => form.querySelector(`#${id}`)?.value || "";
    submit.disabled = true;
    const label = submit.textContent;
    submit.textContent = "One moment…";
    try {
      if (mode === "signup") {
        await store.signUp({ name: val("name"), email: val("email"), password: val("password") });
        toast("Welcome. Your account is ready.");
        afterAuth(next || "/journey");
      } else if (mode === "login") {
        await store.logIn({ email: val("email"), password: val("password") });
        toast("Welcome back.");
        afterAuth(next || "/journey");
      } else if (mode === "forgot") {
        if (!resetReady) {
          if (!store.accountExists(val("email"))) throw new Error("We couldn't find an account with that email on this device. Accounts are stored in the browser where they were created.");
          resetReady = true;
          form.querySelector(".reset-step").hidden = false;
          form.querySelector("#email").readOnly = true;
          root.querySelector(".muted").textContent = "Because your account lives on this device, you can choose a new password right here.";
          form.querySelector("#password").focus();
          submit.disabled = false;
          submit.textContent = "Set new password";
          return;
        }
        await store.resetPassword({ email: val("email"), password: val("password") });
        toast("Your password has been updated.");
        afterAuth(next || "/journey");
      }
    } catch (err) {
      error.textContent = err.message || "Something went wrong. Please try again.";
      const m = error.textContent.toLowerCase();
      const target = m.includes("email") ? "#email" : m.includes("password") ? "#password" : m.includes("call you") ? "#name" : null;
      if (target && form.querySelector(target)) { form.querySelector(target).setAttribute("aria-invalid", "true"); form.querySelector(target).focus(); }
      submit.disabled = false;
      submit.textContent = label;
    }
  });
}
