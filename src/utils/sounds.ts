let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function playTone(freq: number, duration: number, type: OscillatorType = 'square', volume = 0.08) {
  const c = getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime);
  gain.gain.setValueAtTime(volume, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(c.currentTime);
  osc.stop(c.currentTime + duration);
}

export function playTick() {
  playTone(800, 0.05, 'square', 0.04);
}

export function playWin() {
  playTone(523, 0.12, 'square', 0.06);
  setTimeout(() => playTone(659, 0.12, 'square', 0.06), 100);
  setTimeout(() => playTone(784, 0.12, 'square', 0.06), 200);
  setTimeout(() => playTone(1047, 0.25, 'square', 0.06), 300);
}

export function playLose() {
  playTone(400, 0.15, 'sawtooth', 0.05);
  setTimeout(() => playTone(300, 0.25, 'sawtooth', 0.05), 150);
}

export function playJackpot() {
  const notes = [523, 659, 784, 1047, 784, 1047, 1319];
  notes.forEach((n, i) => {
    setTimeout(() => playTone(n, 0.15, 'square', 0.06), i * 80);
  });
}

export function playRoll(duration = 600) {
  const steps = Math.floor(duration / 50);
  for (let i = 0; i < steps; i++) {
    setTimeout(() => playTone(200 + Math.random() * 400, 0.04, 'square', 0.03), i * 50);
  }
}

export function playDeal() {
  playTone(600, 0.06, 'square', 0.05);
  setTimeout(() => playTone(900, 0.06, 'square', 0.05), 50);
}

export function playCashout() {
  playTone(880, 0.1, 'square', 0.06);
  setTimeout(() => playTone(1100, 0.2, 'square', 0.06), 100);
}

export function playMatch() {
  playTone(660, 0.08, 'sine', 0.06);
  setTimeout(() => playTone(880, 0.12, 'sine', 0.06), 80);
}

export function playSpin() {
  playRoll(1500);
}
