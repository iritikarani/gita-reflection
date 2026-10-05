// Beautiful, minimal share cards drawn on <canvas>, plus the share sheet.
import { esc, icon, openModal, toast } from "./ui.js";
import { VERSE_BY_ID } from "./data/verses.js";
import { t, pick, isHindi } from "./i18n.js";
import { CONFIG } from "./config.js";

const SITE = (CONFIG.siteUrl || location.origin).replace(/\/$/, "");
const SITE_HOST = SITE.replace(/^https?:\/\//, "");

// Brand name and web address at the foot of every card.
function drawFooter(ctx) {
  ctx.textAlign = "center";
  ctx.fillStyle = C.ink;
  ctx.font = '600 30px "Cormorant Garamond", "Noto Serif Devanagari", Georgia, serif';
  spaced(ctx, t("Gita Reflection"), W / 2, H - 128, 2);
  ctx.fillStyle = C.gold;
  ctx.font = '500 24px "DM Sans", "Noto Sans Devanagari", system-ui, sans-serif';
  ctx.fillText(SITE_HOST, W / 2, H - 88);
}

const W = 1080, H = 1350;
const C = {
  bg: "#F7F1E6", panel: "#FBF7EF", ink: "#3A2E25", soft: "#6E5D4E",
  gold: "#B8975A", sage: "#5F7059", line: "rgba(184,151,90,.55)"
};

async function ensureFonts() {
  if (!document.fonts?.load) return;
  try {
    await Promise.all([
      document.fonts.load('500 64px "Cormorant Garamond"'),
      document.fonts.load('italic 500 40px "Cormorant Garamond"'),
      document.fonts.load('500 26px "DM Sans"'),
      document.fonts.load('500 40px "Noto Serif Devanagari"', "कर्म"),
      document.fonts.load('500 26px "Noto Sans Devanagari"', "कर्म")
    ]);
  } catch { /* fall back to system fonts */ }
}

function wrap(ctx, text, maxWidth) {
  const words = String(text).split(/\s+/);
  const out = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) { out.push(line); line = w; }
    else line = test;
  }
  if (line) out.push(line);
  return out;
}

function drawFrame(ctx) {
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);
  // soft warm glow
  const g = ctx.createRadialGradient(W / 2, H * 0.35, 50, W / 2, H * 0.35, W * 0.8);
  g.addColorStop(0, "rgba(255,252,245,.9)");
  g.addColorStop(1, "rgba(247,241,230,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // arch frame (jharokha-inspired)
  ctx.strokeStyle = C.line;
  ctx.lineWidth = 2;
  const x = 70, y = 70, w = W - 140, h = H - 140, r = w / 2;
  ctx.beginPath();
  ctx.moveTo(x, y + r);
  ctx.arc(x + r, y + r, r, Math.PI, 0);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
  ctx.stroke();
}

function drawMark(ctx, cx, cy, s = 1) {
  ctx.save();
  ctx.translate(cx - 24 * s, cy - 24 * s);
  ctx.scale(s, s);
  ctx.strokeStyle = C.gold;
  ctx.lineWidth = 1.4;
  ctx.lineCap = "round";
  ctx.stroke(new Path2D("M24 10c4 5 6 10 6 15s-2.5 9-6 12c-3.5-3-6-7-6-12s2-10 6-15z"));
  ctx.stroke(new Path2D("M18 25c-4-2-8-2-11 0 1.5 6 6.5 11 17 12"));
  ctx.stroke(new Path2D("M30 25c4-2 8-2 11 0-1.5 6-6.5 11-17 12"));
  ctx.stroke(new Path2D("M10 41h28"));
  ctx.restore();
}

function spaced(ctx, text, x, y, spacing) {
  // Letter-spaced, centred caption. Devanagari is drawn without spacing so conjuncts stay joined.
  if (/[\u0900-\u097F]/.test(text)) { ctx.textAlign = "center"; ctx.fillText(text, x, y); return; }
  const chars = [...text];
  const width = chars.reduce((s, ch) => s + ctx.measureText(ch).width + spacing, -spacing);
  let cx = x - width / 2;
  ctx.textAlign = "left";
  for (const ch of chars) { ctx.fillText(ch, cx, y); cx += ctx.measureText(ch).width + spacing; }
  ctx.textAlign = "center";
}

export async function renderVerseCard({ verseId, reflection }) {
  await ensureFonts();
  const v = VERSE_BY_ID[verseId];
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  drawFrame(ctx);
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  drawMark(ctx, W / 2, 330, 1.6);

  ctx.fillStyle = C.sage;
  ctx.font = '500 24px "DM Sans", "Noto Sans Devanagari", system-ui, sans-serif';
  spaced(ctx, isHindi() ? "भगवद्गीता से एक विचार" : "A THOUGHT FROM THE BHAGAVAD GITA", W / 2, 420, 4);

  // First line of Sanskrit
  const firstLine = v.sa.split("\n")[0].replace(/[।॥]/g, "").trim();
  ctx.fillStyle = C.soft;
  ctx.font = '500 34px "Noto Serif Devanagari", serif';
  let y = 500;
  for (const l of wrap(ctx, firstLine, W - 300).slice(0, 2)) { ctx.fillText(l, W / 2, y); y += 52; }

  // Meaning
  ctx.fillStyle = C.ink;
  let size = 58;
  ctx.font = `500 ${size}px "Cormorant Garamond", "Noto Serif Devanagari", Georgia, serif`;
  const meaningText = pick(v, "meaning");
  let meaning = wrap(ctx, `“${meaningText}”`, W - 260);
  if (meaning.length > 6) { size = 48; ctx.font = `500 ${size}px "Cormorant Garamond", "Noto Serif Devanagari", Georgia, serif`; meaning = wrap(ctx, `“${meaningText}”`, W - 240); }
  y += 40;
  for (const l of meaning.slice(0, 8)) { ctx.fillText(l, W / 2, y); y += size * 1.22; }

  ctx.fillStyle = C.gold;
  ctx.font = '500 26px "DM Sans", "Noto Sans Devanagari", system-ui, sans-serif';
  y += 14;
  ctx.fillText(`${t("Bhagavad Gita")} ${v.ch}.${v.v}`, W / 2, y);

  // Reflection
  if (reflection) {
    y += 70;
    ctx.strokeStyle = C.line; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(W / 2 - 60, y - 34); ctx.lineTo(W / 2 + 60, y - 34); ctx.stroke();
    ctx.fillStyle = C.soft;
    ctx.font = 'italic 500 36px "Cormorant Garamond", "Noto Serif Devanagari", Georgia, serif';
    for (const l of wrap(ctx, reflection, W - 300).slice(0, 4)) { ctx.fillText(l, W / 2, y + 10); y += 46; }
  }

  drawFooter(ctx);
  return canvas;
}

export async function renderCompletionCard({ name, date, themes }) {
  await ensureFonts();
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  drawFrame(ctx);
  ctx.textAlign = "center";
  drawMark(ctx, W / 2, 330, 1.8);

  ctx.fillStyle = C.sage;
  ctx.font = '500 24px "DM Sans", "Noto Sans Devanagari", system-ui, sans-serif';
  spaced(ctx, isHindi() ? "गीता के साथ 7 दिन" : "7 DAYS WITH THE GITA", W / 2, 430, 5);

  ctx.fillStyle = C.ink;
  ctx.font = '500 66px "Cormorant Garamond", "Noto Serif Devanagari", Georgia, serif';
  let y = 540;
  for (const l of wrap(ctx, t("You completed your 7-day reflection journey."), W - 300)) { ctx.fillText(l, W / 2, y); y += 78; }

  if (name) {
    ctx.fillStyle = C.soft;
    ctx.font = 'italic 500 44px "Cormorant Garamond", "Noto Serif Devanagari", Georgia, serif';
    ctx.fillText(name, W / 2, y + 30);
    y += 60;
  }

  y += 70;
  ctx.fillStyle = C.soft;
  ctx.font = '400 28px "DM Sans", "Noto Sans Devanagari", system-ui, sans-serif';
  const rows = [themes.slice(0, 4).join("  ·  "), themes.slice(4).join("  ·  ")];
  for (const r of rows) { ctx.fillText(r, W / 2, y); y += 48; }

  y += 50;
  ctx.fillStyle = C.ink;
  ctx.font = 'italic 500 36px "Cormorant Garamond", "Noto Serif Devanagari", Georgia, serif';
  for (const l of wrap(ctx, isHindi() ? "“जैसे नदियाँ समुद्र में मिलती हैं, जो भरता रहता है फिर भी स्थिर रहता है…”" : "“As rivers flow into the ocean, ever being filled yet still…”", W - 320)) { ctx.fillText(l, W / 2, y); y += 46; }
  ctx.fillStyle = C.gold;
  ctx.font = '500 24px "DM Sans", "Noto Sans Devanagari", system-ui, sans-serif';
  ctx.fillText(`${t("Bhagavad Gita")} 2.70`, W / 2, y + 6);

  ctx.fillStyle = C.soft;
  ctx.font = '400 26px "DM Sans", "Noto Sans Devanagari", system-ui, sans-serif';
  ctx.fillText(date, W / 2, H - 190);
  drawFooter(ctx);
  return canvas;
}

function toBlob(canvas) {
  return new Promise(resolve => canvas.toBlob(resolve, "image/png"));
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); } catch { /* ignore */ }
    ta.remove();
  }
  toast(t("Copied to your clipboard."));
}

export function verseLink(verseId) {
  return `${SITE}/#/shlok/${verseId.replace(".", "-")}`;
}

export function shareText(verseId, reflection) {
  const v = VERSE_BY_ID[verseId];
  return [
    t("A thought from the Bhagavad Gita"),
    "",
    `“${pick(v, "meaning")}”`,
    `— ${t("Bhagavad Gita")} ${v.ch}.${v.v}`,
    reflection ? `\n${reflection}` : "",
    "",
    `${t("Gita Reflection")} · ${verseLink(verseId)}`
  ].filter((l, i, a) => !(l === "" && a[i - 1] === "")).join("\n");
}

// Opens the share sheet for a verse.
export async function openShare({ verseId, reflection }) {
  const v = VERSE_BY_ID[verseId];
  const text = shareText(verseId, reflection);
  const filename = `gita-reflection-${v.ch}-${v.v}.png`;
  const { el, close } = openModal({
    title: t("Share this moment"),
    className: "share-modal",
    body: `
      <div class="share-preview"><div class="skeleton card-skeleton" aria-label="${t("Preparing your card")}"></div></div>
      <div class="share-actions">
        <button class="share-opt" data-act="instagram" type="button">${icon("instagram")}<span>Instagram</span></button>
        <button class="share-opt" data-act="whatsapp" type="button">${icon("whatsapp")}<span>WhatsApp</span></button>
        <button class="share-opt" data-act="copy" type="button">${icon("copy")}<span>${t("Copy text")}</span></button>
        <button class="share-opt" data-act="download" type="button">${icon("download")}<span>${t("Download image")}</span></button>
      </div>
      <p class="fine center">${t("Cards show the simple meaning (our interpretation) alongside the verse reference.")}</p>`
  });

  let blob = null;
  try {
    const canvas = await renderVerseCard({ verseId, reflection });
    blob = await toBlob(canvas);
    const url = URL.createObjectURL(blob);
    const preview = el.querySelector(".share-preview");
    if (preview) preview.innerHTML = `<img src="${url}" alt="${t("Share card")}: ${esc(pick(v, "meaning"))} — ${t("Bhagavad Gita")} ${v.ch}.${v.v}" width="540" height="675">`;
  } catch (e) {
    console.error(e);
    const preview = el.querySelector(".share-preview");
    if (preview) preview.innerHTML = `<p class="muted center">${t("We couldn't prepare the image, but you can still copy the text.")}</p>`;
  }

  el.querySelector(".share-actions").addEventListener("click", async e => {
    const btn = e.target.closest("[data-act]");
    if (!btn) return;
    const act = btn.dataset.act;
    if (act === "copy") return copyText(text);
    if (act === "whatsapp") return window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    if (!blob) return toast(t("The image is still being prepared."));
    if (act === "download") { downloadBlob(blob, filename); return toast(t("Image saved.")); }
    if (act === "instagram") {
      const file = new File([blob], filename, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        try { await navigator.share({ files: [file], text }); close(); } catch { /* cancelled */ }
      } else {
        downloadBlob(blob, filename);
        toast(t("Image saved — add it to your Instagram story or post."));
      }
    }
  });
}
