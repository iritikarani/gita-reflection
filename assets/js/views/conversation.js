import { esc, icon, autoGrow, mark } from "../ui.js";
import { VERSE_BY_ID } from "../data/verses.js";
import { EMOTIONS, isCrisis } from "../data/emotions.js";
import { buildReflection, localizeReflection } from "../matcher.js";
import { t, pick, isHindi } from "../i18n.js";
import { crisisBlock, saveWithPrompt } from "../components.js";
import { session } from "../store.js";
import { openShare } from "../share.js";
import { openBreathe } from "./breathe.js";

const DIRECTIONS = [
  { id: "fail", label: "I'm afraid of failing", input: { text: "I'm afraid of failing" } },
  { id: "want", label: "I don't know what I want", input: { emotion: "lost" }, said: "I don't know what I want." },
  { id: "tired", label: "I'm exhausted", input: { emotion: "tired" }, said: "I'm exhausted." },
  { id: "another", label: "I need another perspective" },
  { id: "sit", label: "I just want to sit with this" }
];

const STARTERS = {
  en: ["I don't know whether I should continue.", "I feel like I'm falling behind everyone.", "Mujhe samajh nahi aa raha kya karun."],
  hi: ["मुझे नहीं पता कि आगे जारी रखूँ या नहीं।", "लगता है मैं सबसे पीछे छूट रहा/रही हूँ।", "Mujhe samajh nahi aa raha kya karun."]
};
const starters = () => STARTERS[isHindi() ? "hi" : "en"];

// A message's text in the current language (messages store keys, not text, where possible).
function userText(m) {
  if (m.dir) { const d = DIRECTIONS.find(x => x.id === m.dir); return t(d.said || d.label); }
  return m.text;
}

function guideReply(input, exclude = [], another = false) {
  const r = buildReflection({ ...input, exclude });
  return { role: "guide", kind: "reflection", input, another, ...r };
}

function renderMessage(m, i) {
  if (m.role === "user") return `<div class="msg user"><p>${esc(userText(m))}</p></div>`;
  if (m.kind === "intro") return `
    <div class="msg guide intro">
      ${mark("msg-mark")}
      <p>${t("Hello. This is a quiet space to think something through.")}</p>
      <p>${t("Share what's on your mind — a sentence is enough. I'll offer a teaching from the Bhagavad Gita and one question to sit with.")}</p>
    </div>`;
  if (m.kind === "crisis") return `<div class="msg guide crisis-msg">${crisisBlock()}</div>`;
  if (m.kind === "sit") return `
    <div class="msg guide sit">
      <p>${t("Of course. There's nothing you need to do right now.")}</p>
      <div class="sit-orb" aria-hidden="true"><span></span></div>
      <p class="muted">${t("Let your breath slow down on its own. Stay as long as you like.")}</p>
      <button class="btn btn-ghost btn-sm" type="button" data-breathe="${i}">${icon("breath")}<span>${t("Start a 2-minute pause")}</span></button>
    </div>`;
  const v = VERSE_BY_ID[m.verseId];
  const r = localizeReflection(m);
  const ack = m.another ? t("Here's another way of seeing it.") : pick(EMOTIONS[m.emotion] || EMOTIONS.general, "ack");
  return `
    <div class="msg guide">
      <p class="ack">${esc(ack)}</p>
      <div class="teach">
        <p class="verse-ref"><a href="#/shlok/${v.ch}-${v.v}">${t("Bhagavad Gita")} ${v.ch}.${v.v}</a></p>
        <p class="teach-sa" lang="sa">${esc(v.sa.split("\n")[0])}</p>
        <p class="teach-en" lang="${isHindi() ? "hi" : "en"}">${esc(isHindi() ? v.hi : v.en)}</p>
      </div>
      <p>${esc(r.why)}</p>
      <p class="question">${esc(r.question)}</p>
      <div class="msg-tools">
        <button class="btn btn-link btn-sm" type="button" data-save="${i}">${icon("bookmark")}<span>${m.savedId ? t("Saved") : t("Save")}</span></button>
        <button class="btn btn-link btn-sm" type="button" data-share="${i}">${icon("share")}<span>${t("Share")}</span></button>
        <button class="btn btn-link btn-sm" type="button" data-breathe="${i}">${icon("breath")}<span>${t("Pause")}</span></button>
      </div>
    </div>
`;
}

export function render(root) {
  let log = session.get("convo", null) || [{ role: "guide", kind: "intro" }];

  root.innerHTML = `
  <section class="convo">
    <header class="wrap narrow page-head center">
      <p class="eyebrow">${t("Reflect with the Gita")}</p>
      <h1>${t("Think it through, gently")}</h1>
      <p class="muted">${t("Guided reflection inspired by the Bhagavad Gita. This is not Krishna, and not a therapist — just a quiet companion. Responses are chosen from verses and reflections written for this site; nothing you type leaves your device.")}</p>
    </header>
    <div class="wrap narrow">
      <div class="thread" id="thread" aria-live="polite" aria-relevant="additions"></div>
      <div class="directions" id="directions" role="group" aria-label="${t("Possible directions")}"></div>
      <form class="composer" id="composer" autocomplete="off">
        <label class="sr-only" for="composer-input">${t("Share what's on your mind")}</label>
        <textarea id="composer-input" rows="1" maxlength="600" placeholder="${t("Share what's on your mind…")}"></textarea>
        <button class="btn btn-primary composer-send" type="submit" aria-label="${t("Send")}">${icon("arrow")}</button>
      </form>
      <div class="convo-foot">
        <button class="btn btn-link btn-sm" type="button" id="restart">${t("Start over")}</button>
      </div>
    </div>
  </section>`;

  const thread = root.querySelector("#thread");
  const directions = root.querySelector("#directions");
  const form = root.querySelector("#composer");
  const input = root.querySelector("#composer-input");
  autoGrow(input);

  function persist() { session.set("convo", log); }

  function draw(scroll = false) {
    thread.innerHTML = log.map((m, i) => renderMessage(m, i)).join("");
    const last = log[log.length - 1];
    const hasReflection = log.some(m => m.kind === "reflection");
    if (last.kind === "intro") {
      directions.innerHTML = starters().map(s => `<button type="button" class="chip chip-soft" data-starter="${esc(s)}">${esc(s)}</button>`).join("");
    } else if (last.kind === "crisis") {
      directions.innerHTML = "";
    } else {
      directions.innerHTML = DIRECTIONS
        .filter(d => !(d.id === "another" && !hasReflection))
        .map(d => `<button type="button" class="chip chip-soft" data-dir="${d.id}">${esc(t(d.label))}</button>`).join("");
    }
    if (scroll) {
      const msgs = thread.querySelectorAll(".msg");
      const target = msgs[msgs.length - 1];
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function shownVerses() { return log.filter(m => m.kind === "reflection").map(m => m.verseId); }
  function lastReflection() { return [...log].reverse().find(m => m.kind === "reflection"); }

  function send(text, said) {
    log.push({ role: "user", text: said || text });
    if (isCrisis(text)) {
      log.push({ role: "guide", kind: "crisis" });
    } else {
      log.push(guideReply({ text }, shownVerses()));
    }
    persist();
    draw(true);
  }

  form.addEventListener("submit", e => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return input.focus();
    input.value = "";
    input.style.height = "";
    send(text);
  });

  input.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); }
  });

  directions.addEventListener("click", e => {
    const starter = e.target.closest("[data-starter]");
    if (starter) return send(starter.dataset.starter);
    const btn = e.target.closest("[data-dir]");
    if (!btn) return;
    const d = DIRECTIONS.find(x => x.id === btn.dataset.dir);
    if (d.id === "sit") {
      log.push({ role: "user", dir: d.id }, { role: "guide", kind: "sit" });
    } else if (d.id === "another") {
      const prev = lastReflection();
      log.push({ role: "user", dir: d.id });
      log.push(guideReply(prev?.input || { text: "" }, shownVerses(), true));
    } else {
      log.push({ role: "user", dir: d.id });
      log.push(guideReply(d.input, shownVerses()));
    }
    persist();
    draw(true);
  });

  thread.addEventListener("click", e => {
    const save = e.target.closest("[data-save]");
    const share = e.target.closest("[data-share]");
    const breathe = e.target.closest("[data-breathe]");
    if (save) {
      const i = Number(save.dataset.save);
      const m = log[i];
      const prevUser = [...log.slice(0, i)].reverse().find(x => x.role === "user");
      const said = prevUser ? userText(prevUser) : "";
      const saved = saveWithPrompt({ id: m.savedId, source: "conversation", said, emotion: m.emotion, group: m.group, verseId: m.verseId, question: localizeReflection(m).question, text: "" });
      if (saved) { m.savedId = saved.id; persist(); save.querySelector("span").textContent = t("Saved"); }
    }
    if (share) { const m = log[Number(share.dataset.share)]; openShare({ verseId: m.verseId, reflection: localizeReflection(m).question }); }
    if (breathe) {
      const m = log[Number(breathe.dataset.breathe)];
      const ref = m.kind === "reflection" ? m : lastReflection();
      openBreathe({ verseId: ref?.verseId, question: ref && localizeReflection(ref).question });
    }
  });

  root.querySelector("#restart").addEventListener("click", () => {
    log = [{ role: "guide", kind: "intro" }];
    persist();
    draw();
    input.focus();
  });

  draw();
}
