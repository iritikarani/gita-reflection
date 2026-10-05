import { esc, icon, autoGrow, mark } from "../ui.js";
import { VERSE_BY_ID } from "../data/verses.js";
import { EMOTIONS, isCrisis } from "../data/emotions.js";
import { buildReflection } from "../matcher.js";
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

const STARTERS = [
  "I don't know whether I should continue.",
  "I feel like I'm falling behind everyone.",
  "Mujhe samajh nahi aa raha kya karun."
];

function guideReply(input, exclude = [], ackOverride) {
  const r = buildReflection({ ...input, exclude });
  const e = EMOTIONS[r.emotion] || EMOTIONS.general;
  return { role: "guide", kind: "reflection", input, ack: ackOverride || e.ack, ...r };
}

function renderMessage(m, i) {
  if (m.role === "user") return `<div class="msg user"><p>${esc(m.text)}</p></div>`;
  if (m.kind === "intro") return `
    <div class="msg guide intro">
      ${mark("msg-mark")}
      <p>Hello. This is a quiet space to think something through.</p>
      <p>Share what's on your mind — a sentence is enough. I'll offer a teaching from the Bhagavad Gita and one question to sit with.</p>
    </div>`;
  if (m.kind === "crisis") return `<div class="msg guide crisis-msg">${crisisBlock()}</div>`;
  if (m.kind === "sit") return `
    <div class="msg guide sit">
      <p>Of course. There's nothing you need to do right now.</p>
      <div class="sit-orb" aria-hidden="true"><span></span></div>
      <p class="muted">Let your breath slow down on its own. Stay as long as you like.</p>
      <button class="btn btn-ghost btn-sm" type="button" data-breathe="${i}">${icon("breath")}<span>Start a 2-minute pause</span></button>
    </div>`;
  const v = VERSE_BY_ID[m.verseId];
  return `
    <div class="msg guide">
      <p class="ack">${esc(m.ack)}</p>
      <div class="teach">
        <p class="verse-ref"><a href="#/shlok/${v.ch}-${v.v}">Bhagavad Gita ${v.ch}.${v.v}</a></p>
        <p class="teach-sa" lang="sa">${esc(v.sa.split("\n")[0])}</p>
        <p class="teach-en">${esc(v.en)}</p>
      </div>
      <p>${esc(m.why)}</p>
      <p class="question">${esc(m.question)}</p>
      <div class="msg-tools">
        <button class="btn btn-link btn-sm" type="button" data-save="${i}">${icon("bookmark")}<span>${m.savedId ? "Saved" : "Save"}</span></button>
        <button class="btn btn-link btn-sm" type="button" data-share="${i}">${icon("share")}<span>Share</span></button>
        <button class="btn btn-link btn-sm" type="button" data-breathe="${i}">${icon("breath")}<span>Pause</span></button>
      </div>
    </div>
`;
}

export function render(root) {
  let log = session.get("convo", null) || [{ role: "guide", kind: "intro" }];

  root.innerHTML = `
  <section class="convo">
    <header class="wrap narrow page-head center">
      <p class="eyebrow">Reflect with the Gita</p>
      <h1>Think it through, gently</h1>
      <p class="muted">Guided reflection inspired by the Bhagavad Gita. This is not Krishna, and not a therapist — just a quiet companion. Responses are chosen from verses and reflections written for this site; nothing you type leaves your device.</p>
    </header>
    <div class="wrap narrow">
      <div class="thread" id="thread" aria-live="polite" aria-relevant="additions"></div>
      <div class="directions" id="directions" role="group" aria-label="Possible directions"></div>
      <form class="composer" id="composer" autocomplete="off">
        <label class="sr-only" for="composer-input">Share what's on your mind</label>
        <textarea id="composer-input" rows="1" maxlength="600" placeholder="Share what's on your mind…"></textarea>
        <button class="btn btn-primary composer-send" type="submit" aria-label="Send">${icon("arrow")}</button>
      </form>
      <div class="convo-foot">
        <button class="btn btn-link btn-sm" type="button" id="restart">Start over</button>
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
      directions.innerHTML = STARTERS.map(s => `<button type="button" class="chip chip-soft" data-starter="${esc(s)}">${esc(s)}</button>`).join("");
    } else if (last.kind === "crisis") {
      directions.innerHTML = "";
    } else {
      directions.innerHTML = DIRECTIONS
        .filter(d => !(d.id === "another" && !hasReflection))
        .map(d => `<button type="button" class="chip chip-soft" data-dir="${d.id}">${esc(d.label)}</button>`).join("");
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
      log.push({ role: "user", text: d.label }, { role: "guide", kind: "sit" });
    } else if (d.id === "another") {
      const prev = lastReflection();
      log.push({ role: "user", text: d.label });
      log.push(guideReply(prev?.input || { text: "" }, shownVerses(), "Here's another way of seeing it."));
    } else {
      log.push({ role: "user", text: d.said || d.label });
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
      const said = [...log.slice(0, i)].reverse().find(x => x.role === "user")?.text || "";
      const saved = saveWithPrompt({ id: m.savedId, source: "conversation", said, emotion: m.emotion, group: m.group, verseId: m.verseId, question: m.question, text: "" });
      if (saved) { m.savedId = saved.id; persist(); save.querySelector("span").textContent = "Saved"; }
    }
    if (share) { const m = log[Number(share.dataset.share)]; openShare({ verseId: m.verseId, reflection: m.question }); }
    if (breathe) {
      const m = log[Number(breathe.dataset.breathe)];
      const ref = m.kind === "reflection" ? m : lastReflection();
      openBreathe({ verseId: ref?.verseId, question: ref?.question });
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
