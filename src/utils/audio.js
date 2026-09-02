/**
 * SNPSHOT Web Audio API Sound Synthesizer
 * Generates tactile, nostalgic Y2K/Retro sound effects programmatically
 * to ensure zero external loading lag and total offline reliability.
 */

let audioCtx = null;
let isMuted = false;
try {
  if (typeof window !== "undefined" && window.localStorage) {
    isMuted = window.localStorage.getItem("snpshot_muted") === "true";
  }
} catch (e) {
  // Graceful fallback for restricted iframe storage environments
  isMuted = false;
}

export const getMuted = () => {
  return isMuted;
};

export const setMuted = (muted) => {
  isMuted = muted;
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem("snpshot_muted", String(muted));
    }
  } catch (e) {
    // Ignore storage write error in restricted iframe environments
  }
};

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  // Resume context if it was suspended (browser security autoplay policies)
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
};

/**
 * 1. Classic Digital Camera Shutter Sound
 * Synthesizes a high-frequency metal click + white noise shutter mechanism
 */
export const playShutterSound = () => {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Shutter Click - Sine oscillator high pitch drop
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);
    
    gainNode.gain.setValueAtTime(0.5, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);

    // Mechanical Noise Burst - Simulates shutter curtain moving
    const bufferSize = ctx.sampleRate * 0.15; // 150ms noise
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.value = 1000;
    noiseFilter.Q.value = 2;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.2, now);
    noiseGain.gain.setValueAtTime(0.3, now + 0.02);
    noiseGain.gain.exponentialRampToValueAtTime(0.005, now + 0.15);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noise.start(now + 0.01);
    noise.stop(now + 0.16);
  } catch (err) {
    console.warn("Audio context not allowed or failed to play shutter sound:", err);
  }
};

/**
 * 2. Tactile Button Click "Pop"
 * A short, satisfying analog-style keycap tap
 */
export const playClickSound = () => {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.04);

    gainNode.gain.setValueAtTime(0.15, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  } catch (err) {
    // Fail silently
  }
};

/**
 * 3. Happy Success / Safe Print Chime
 * An uplifting retro synth arpeggio (C Major chord)
 */
export const playSuccessChime = () => {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + index * 0.08);

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.12, now + index * 0.08 + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.25);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + index * 0.08);
      osc.stop(now + index * 0.08 + 0.3);
    });
  } catch (err) {
    // Fail silently
  }
};

/**
 * 4. Self-Timer Beep Sound
 * A high-frequency prompt warning the user the camera is about to capture
 */
export const playBeepSound = () => {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(1500, now);

    gainNode.gain.setValueAtTime(0.15, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  } catch (err) {
    // Fail silently
  }
};

/**
 * 5. Decor / Sticker Placement Pop
 * A bubbly, playful pitch-bend upward "boing"
 */
export const playStickerPopSound = () => {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(650, now + 0.12);

    gainNode.gain.setValueAtTime(0.15, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  } catch (err) {
    // Fail silently
  }
};
