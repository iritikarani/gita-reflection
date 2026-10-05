// "Peaceful ambience": a soft, generated soundscape (filtered noise like distant
// wind plus a low, slowly breathing drone). Off by default; no audio files.
let ctx = null;
let master = null;
let nodes = [];

export function isPlaying() { return Boolean(ctx && master && ctx.state === "running" && nodes.length); }

export function startAmbience() {
  if (isPlaying()) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctx = ctx || new AC();
  ctx.resume();
  master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  // Brown noise -> lowpass: soft wind
  const len = ctx.sampleRate * 4;
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    data[i] = last * 3.2;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer; noise.loop = true;
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass"; lp.frequency.value = 520;
  const noiseGain = ctx.createGain(); noiseGain.gain.value = 0.32;
  noise.connect(lp).connect(noiseGain).connect(master);

  // Slow swell on the wind
  const lfo = ctx.createOscillator(); lfo.frequency.value = 0.06;
  const lfoGain = ctx.createGain(); lfoGain.gain.value = 0.12;
  lfo.connect(lfoGain).connect(noiseGain.gain);

  // Gentle drone (tanpura-like fifths, very quiet)
  const drones = [110, 165, 220].map((f, i) => {
    const o = ctx.createOscillator();
    o.type = "sine"; o.frequency.value = f;
    const g = ctx.createGain(); g.gain.value = [0.05, 0.03, 0.02][i];
    o.connect(g).connect(master);
    return o;
  });

  noise.start(); lfo.start(); drones.forEach(o => o.start());
  nodes = [noise, lfo, ...drones];
  master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 3);
}

export function stopAmbience() {
  if (!ctx || !master) return;
  const m = master, ns = nodes;
  m.gain.cancelScheduledValues(ctx.currentTime);
  m.gain.setValueAtTime(m.gain.value, ctx.currentTime);
  m.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
  setTimeout(() => { ns.forEach(n => { try { n.stop(); } catch { /* ignore */ } }); m.disconnect(); }, 1700);
  nodes = []; master = null;
}
