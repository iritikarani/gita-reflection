// Small UI helpers shared by every view.
import { t, locale } from "./i18n.js";

export function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[ch]));
}

// Multi-line text -> <br>-separated, escaped.
export function lines(value) {
  return esc(value).replace(/\n/g, "<br>");
}

export function $(sel, root = document) { return root.querySelector(sel); }
export function $$(sel, root = document) { return [...root.querySelectorAll(sel)]; }

export function on(root, selector, event, handler) {
  root.addEventListener(event, e => {
    const target = e.target.closest(selector);
    if (target && root.contains(target)) handler(e, target);
  });
}

const ICONS = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20h14V9.5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  chat: '<path d="M4 5h16v11H8l-4 4z"/>',
  book: '<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 19.5V4.5"/>',
  path: '<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h6a4 4 0 0 0 0-8h-4a4 4 0 0 1 0-8h6"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
  bookmark: '<path d="M6 3h12v18l-6-4-6 4z"/>',
  share: '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4"/>',
  download: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',
  refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>',
  breath: '<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8" opacity=".5"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  arrow: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
  back: '<path d="M19 12H5"/><path d="m11 18-6-6 6-6"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
  whatsapp: '<path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 1c-1-.5-1.5-1-2-2l1-1-1-2z"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8"/>',
  sound: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6"/>',
  check: '<path d="m5 12 5 5 9-10"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  print: '<path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/>'
};

export function icon(name, label) {
  const a11y = label ? `role="img" aria-label="${esc(label)}"` : 'aria-hidden="true"';
  return `<svg class="icon" viewBox="0 0 24 24" ${a11y} fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ""}</svg>`;
}

// The small lotus-arch mark used as the logo and as quiet section ornaments.
export function mark(cls = "mark") {
  return `<svg class="${cls}" viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
    <path d="M24 10c4 5 6 10 6 15s-2.5 9-6 12c-3.5-3-6-7-6-12s2-10 6-15z"/>
    <path d="M18 25c-4-2-8-2-11 0 1.5 6 6.5 11 17 12"/>
    <path d="M30 25c4-2 8-2 11 0-1.5 6-6.5 11-17 12"/>
    <path d="M10 41h28"/>
  </svg>`;
}

export function divider() {
  return `<div class="divider" aria-hidden="true"><span></span>${mark("divider-mark")}<span></span></div>`;
}

// ---- Toast ----
let toastTimer;
export function toast(message) {
  let el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.className = "toast";
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 3200);
}

// ---- Modal (accessible dialog) ----
const openModals = new Set();
export function closeAllModals() { [...openModals].forEach(close => close({ restoreFocus: false })); }

export function openModal({ title, body, className = "", onOpen, labelledBy, closeLabel }) {
  const previous = document.activeElement;
  const wrap = document.createElement("div");
  wrap.className = "modal-backdrop";
  const titleId = labelledBy || `modal-title-${Date.now()}`;
  wrap.innerHTML = `
    <div class="modal ${className}" role="dialog" aria-modal="true" aria-labelledby="${titleId}">
      <button class="icon-btn modal-close" type="button" aria-label="${esc(closeLabel || t("Close"))}">${icon("close")}</button>
      ${title ? `<h2 class="modal-title" id="${titleId}">${esc(title)}</h2>` : ""}
      <div class="modal-body">${body}</div>
    </div>`;
  document.body.appendChild(wrap);
  document.body.classList.add("modal-open");
  const modal = wrap.querySelector(".modal");

  function close({ restoreFocus = true } = {}) {
    if (!openModals.has(close)) return;
    openModals.delete(close);
    wrap.classList.remove("show");
    document.removeEventListener("keydown", onKey);
    setTimeout(() => {
      wrap.remove();
      if (!document.querySelector(".modal-backdrop")) document.body.classList.remove("modal-open");
    }, 260);
    if (restoreFocus && previous && previous.focus) previous.focus();
  }
  openModals.add(close);

  function focusables() {
    return [...modal.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])')]
      .filter(el => el.offsetParent !== null);
  }

  function onKey(e) {
    if (e.key === "Escape") { e.preventDefault(); close(); }
    if (e.key === "Tab") {
      const f = focusables();
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  document.addEventListener("keydown", onKey);
  wrap.addEventListener("click", e => { if (e.target === wrap) close(); });
  wrap.querySelector(".modal-close").addEventListener("click", () => close());
  requestAnimationFrame(() => {
    wrap.classList.add("show");
    const f = focusables();
    (f.find(el => !el.classList.contains("modal-close")) || f[0])?.focus();
  });
  if (onOpen) onOpen(modal, close);
  return { el: modal, close };
}

export function formatDate(ts, opts = { day: "numeric", month: "short", year: "numeric" }) {
  try { return new Date(ts).toLocaleDateString(locale(), opts); }
  catch { return new Date(ts).toDateString(); }
}

export function plural(n, word, pluralWord) {
  return `${n} ${n === 1 ? word : (pluralWord || word + "s")}`;
}

// Auto-grow a textarea to fit its content, within CSS max-height.
export function autoGrow(textarea) {
  const fit = () => { textarea.style.height = "auto"; textarea.style.height = `${textarea.scrollHeight + 2}px`; };
  textarea.addEventListener("input", fit);
  fit();
}

export function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
