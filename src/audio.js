const audioState = {
  ctx: null,
  master: null,
  sfx: null,
  ambient: null,
  enabled: true,
  unlocked: false,
  lastPlayed: new Map(),
  loops: new Map(),
};

function now() {
  return audioState.ctx?.currentTime ?? 0;
}

function makeGain(value = 1, destination = audioState.sfx) {
  const gain = audioState.ctx.createGain();
  gain.gain.value = value;
  gain.connect(destination);
  return gain;
}

function oscillator({ type = "sine", frequency = 440, endFrequency = null, duration = 0.12, gain = 0.25, destination = audioState.sfx }) {
  if (!audioState.ctx || !audioState.enabled) return;
  const t = now();
  const osc = audioState.ctx.createOscillator();
  const amp = makeGain(0.0001, destination);
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, t);
  if (endFrequency) osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFrequency), t + duration);
  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.exponentialRampToValueAtTime(Math.max(0.0001, gain), t + 0.012);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(amp);
  osc.start(t);
  osc.stop(t + duration + 0.02);
}

function noise({ duration = 0.18, gain = 0.18, frequency = 900, destination = audioState.sfx }) {
  if (!audioState.ctx || !audioState.enabled) return;
  const t = now();
  const sampleRate = audioState.ctx.sampleRate;
  const buffer = audioState.ctx.createBuffer(1, Math.max(1, Math.floor(sampleRate * duration)), sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  const source = audioState.ctx.createBufferSource();
  const filter = audioState.ctx.createBiquadFilter();
  const amp = makeGain(0.0001, destination);
  filter.type = "bandpass";
  filter.frequency.value = frequency;
  filter.Q.value = 1.8;
  amp.gain.setValueAtTime(gain, t);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  source.buffer = buffer;
  source.connect(filter);
  filter.connect(amp);
  source.start(t);
  source.stop(t + duration);
}

function canPlay(name, cooldown = 0.03) {
  if (!audioState.ctx || !audioState.enabled) return false;
  const t = now();
  const last = audioState.lastPlayed.get(name) ?? -999;
  if (t - last < cooldown) return false;
  audioState.lastPlayed.set(name, t);
  return true;
}

export function initAudio() {
  if (audioState.unlocked) return;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  audioState.ctx = audioState.ctx ?? new AudioContextClass();
  audioState.master = audioState.master ?? audioState.ctx.createGain();
  audioState.sfx = audioState.sfx ?? audioState.ctx.createGain();
  audioState.ambient = audioState.ambient ?? audioState.ctx.createGain();
  audioState.master.gain.value = 0.72;
  audioState.sfx.gain.value = 0.72;
  audioState.ambient.gain.value = 0.2;
  audioState.sfx.connect(audioState.master);
  audioState.ambient.connect(audioState.master);
  audioState.master.connect(audioState.ctx.destination);
  audioState.ctx.resume();
  audioState.unlocked = true;
}

export function setAudioEnabled(enabled) {
  audioState.enabled = enabled;
  if (audioState.master) audioState.master.gain.value = enabled ? 0.72 : 0.0001;
}

export function isAudioEnabled() {
  return audioState.enabled;
}

export function playSound(name, options = {}) {
  if (!audioState.unlocked) return;
  const pitch = options.pitch ?? 1;
  const intensity = options.intensity ?? 1;
  if (!canPlay(name, options.cooldown ?? 0.035)) return;

  if (name === "ui") oscillator({ frequency: 520 * pitch, endFrequency: 720 * pitch, duration: 0.07, gain: 0.13 });
  if (name === "start") {
    oscillator({ type: "triangle", frequency: 220, endFrequency: 660, duration: 0.16, gain: 0.22 });
    oscillator({ type: "square", frequency: 880, endFrequency: 1320, duration: 0.09, gain: 0.07 });
  }
  if (name === "playerHit") {
    oscillator({ type: "sawtooth", frequency: 180, endFrequency: 70, duration: 0.18, gain: 0.2 });
    noise({ duration: 0.12, gain: 0.13, frequency: 420 });
  }
  if (name === "lowAmmo") oscillator({ type: "square", frequency: 180, endFrequency: 130, duration: 0.1, gain: 0.13 });
  if (name === "gateGood") oscillator({ type: "triangle", frequency: 480 * pitch, endFrequency: 920 * pitch, duration: 0.18, gain: 0.18 });
  if (name === "gateBad") oscillator({ type: "triangle", frequency: 360, endFrequency: 180, duration: 0.18, gain: 0.16 });
  if (name === "gateHit") {
    oscillator({ type: "square", frequency: 240 + intensity * 40, endFrequency: 170, duration: 0.06, gain: 0.08 });
    noise({ duration: 0.045, gain: 0.06, frequency: 1200 });
  }
  if (name === "gateBreak") {
    oscillator({ type: "triangle", frequency: 280, endFrequency: 760, duration: 0.16, gain: 0.16 });
    noise({ duration: 0.2, gain: 0.15, frequency: 1800 });
  }
  if (name === "coin") oscillator({ type: "sine", frequency: 980 + Math.random() * 160, endFrequency: 1480, duration: 0.08, gain: 0.08 });
  if (name === "weapon") {
    oscillator({ type: "sawtooth", frequency: 160 * pitch, endFrequency: 620 * pitch, duration: 0.22, gain: 0.18 });
    oscillator({ type: "triangle", frequency: 720 * pitch, endFrequency: 1180 * pitch, duration: 0.16, gain: 0.11 });
  }
  if (name === "enemyShot") oscillator({ type: "sawtooth", frequency: 620 * pitch, endFrequency: 210 * pitch, duration: 0.09, gain: 0.08 });
  if (name === "enemyWindup") oscillator({ type: "sine", frequency: 380 * pitch, endFrequency: 720 * pitch, duration: 0.12, gain: 0.07 });
  if (name === "enemyDeath") {
    oscillator({ type: "triangle", frequency: 220, endFrequency: 90, duration: 0.16, gain: 0.13 });
    noise({ duration: 0.16, gain: 0.11, frequency: 760 });
  }
  if (name === "bossIntro") {
    oscillator({ type: "sawtooth", frequency: 80, endFrequency: 130, duration: 0.5, gain: 0.22 });
    noise({ duration: 0.35, gain: 0.12, frequency: 360 });
  }
  if (name === "bossShot") {
    oscillator({ type: "sawtooth", frequency: 110 * pitch, endFrequency: 70 * pitch, duration: 0.11, gain: 0.11 });
    noise({ duration: 0.08, gain: 0.08, frequency: 520 });
  }
  if (name === "bossShield") oscillator({ type: "square", frequency: 220, endFrequency: 390, duration: 0.09, gain: 0.1 });
  if (name === "bossShieldBreak") {
    oscillator({ type: "sawtooth", frequency: 180, endFrequency: 45, duration: 0.42, gain: 0.23 });
    noise({ duration: 0.35, gain: 0.2, frequency: 950 });
  }
  if (name === "bossEnrage") {
    oscillator({ type: "sawtooth", frequency: 130, endFrequency: 520, duration: 0.55, gain: 0.22 });
    oscillator({ type: "square", frequency: 70, endFrequency: 90, duration: 0.6, gain: 0.16 });
  }
  if (name === "victory") {
    [440, 660, 880].forEach((frequency, i) => setTimeout(() => oscillator({ type: "triangle", frequency, endFrequency: frequency * 1.2, duration: 0.18, gain: 0.16 }), i * 90));
  }
  if (name === "defeat") {
    oscillator({ type: "sawtooth", frequency: 220, endFrequency: 55, duration: 0.5, gain: 0.22 });
    noise({ duration: 0.28, gain: 0.12, frequency: 240 });
  }
}

export function playWeaponSound(weaponId) {
  if (weaponId === "carbine") oscillator({ type: "square", frequency: 720 + Math.random() * 60, endFrequency: 460, duration: 0.045, gain: 0.045 });
  if (weaponId === "rifle") oscillator({ type: "sawtooth", frequency: 860 + Math.random() * 90, endFrequency: 520, duration: 0.045, gain: 0.058 });
  if (weaponId === "cannon") playSound("bossShot", { pitch: 0.7, cooldown: 0.08 });
  if (weaponId === "laser") oscillator({ type: "sine", frequency: 980, endFrequency: 1680, duration: 0.11, gain: 0.09 });
  if (weaponId === "overdrive") {
    oscillator({ type: "sawtooth", frequency: 260, endFrequency: 920, duration: 0.13, gain: 0.12 });
    oscillator({ type: "square", frequency: 1040, endFrequency: 520, duration: 0.09, gain: 0.08 });
  }
}

export function startLoop(name) {
  if (!audioState.unlocked || audioState.loops.has(name)) return;
  const tick = () => {
    if (!audioState.loops.has(name)) return;
    if (name === "run") oscillator({ type: "triangle", frequency: 95, endFrequency: 70, duration: 0.05, gain: 0.025, destination: audioState.ambient });
    if (name === "boss") oscillator({ type: "sawtooth", frequency: 58, endFrequency: 66, duration: 0.25, gain: 0.04, destination: audioState.ambient });
    audioState.loops.set(name, window.setTimeout(tick, name === "run" ? 245 : 360));
  };
  audioState.loops.set(name, window.setTimeout(tick, 10));
}

export function stopLoop(name) {
  const id = audioState.loops.get(name);
  if (id) window.clearTimeout(id);
  audioState.loops.delete(name);
}
