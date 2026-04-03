// Simple sound synthesizer using Web Audio API

let audioCtx: AudioContext | null = null;
let globalVolume = 0.5; // Default volume

const getContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

let bgMusicOscillators: OscillatorNode[] = [];
let bgMusicGain: GainNode | null = null;

export const initAudio = () => {
  try {
    const ctx = getContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
  } catch (e) {
    console.error("Audio init error", e);
  }
};

export const playBgMusic = () => {
  try {
    if (bgMusicGain) return; // Already playing
    
    const ctx = getContext();
    if (ctx.state === 'suspended') ctx.resume();

    bgMusicGain = ctx.createGain();
    bgMusicGain.connect(ctx.destination);
    // Keep it ambient but audible
    bgMusicGain.gain.setValueAtTime(0, ctx.currentTime);
    bgMusicGain.gain.linearRampToValueAtTime(0.08 * globalVolume, ctx.currentTime + 2);

    // Create a dark ambient drone using multiple oscillators (shifted up an octave for better audibility on small speakers)
    const frequencies = [110, 220, 329.63]; // A2, A3, E4
    
    frequencies.forEach(freq => {
      const osc = ctx.createOscillator();
      osc.type = 'triangle'; // Triangle is more audible than sine for low frequencies
      osc.frequency.value = freq;
      
      // Add some slow modulation
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.1 + Math.random() * 0.1; // Very slow
      
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 3; // Detune amount
      
      lfo.connect(lfoGain);
      lfoGain.connect(osc.detune);
      
      osc.connect(bgMusicGain!);
      
      osc.start();
      lfo.start();
      
      bgMusicOscillators.push(osc, lfo);
    });
  } catch (e) {
    console.error("Audio error", e);
  }
};

export const stopBgMusic = () => {
  try {
    if (!bgMusicGain) return;
    
    const ctx = getContext();
    const currentGain = bgMusicGain;
    const currentOscillators = bgMusicOscillators;
    
    bgMusicGain = null;
    bgMusicOscillators = [];
    
    currentGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
    
    setTimeout(() => {
      currentOscillators.forEach(osc => {
        try { osc.stop(); } catch (e) {}
      });
      try { currentGain.disconnect(); } catch (e) {}
    }, 1000);
  } catch (e) {
    console.error("Audio error", e);
  }
};

export const updateBgMusicVolume = () => {
  if (bgMusicGain) {
    const ctx = getContext();
    bgMusicGain.gain.setTargetAtTime(0.08 * globalVolume, ctx.currentTime, 0.1);
  }
};

export const setVolume = (volume: number) => {
  globalVolume = Math.max(0, Math.min(1, volume));
  updateBgMusicVolume();
};

export const playMoveSound = () => {
  try {
    const ctx = getContext();
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // "Digital Blip"
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.1 * globalVolume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01 * globalVolume, ctx.currentTime + 0.08);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch (e) {
    console.error("Audio error", e);
  }
};

export const playWinSound = () => {
  try {
    const ctx = getContext();
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;
    
    // Futuristic Arpeggio
    [440, 554.37, 659.25, 880, 1108.73, 1318.51].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = i % 2 === 0 ? 'square' : 'sawtooth'; // Mix of square and saw for retro synth feel
      osc.frequency.value = freq;
      
      const startTime = now + i * 0.08;
      const duration = 0.2;
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.05 * globalVolume, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001 * globalVolume, startTime + duration);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  } catch (e) {
    console.error("Audio error", e);
  }
};

export const playShuffleSound = () => {
  try {
    const ctx = getContext();
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // "Data Scramble"
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.15);
    osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.05 * globalVolume, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.02 * globalVolume, ctx.currentTime + 0.15);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {
    console.error("Audio error", e);
  }
};

export const playHintSound = () => {
  try {
    const ctx = getContext();
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // "Magical Chime"
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.05 * globalVolume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001 * globalVolume, ctx.currentTime + 0.5);

    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    console.error("Audio error", e);
  }
};

export const playErrorSound = () => {
  try {
    const ctx = getContext();
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // "Access Denied Buzz"
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.1 * globalVolume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01 * globalVolume, ctx.currentTime + 0.15);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {
    console.error("Audio error", e);
  }
};
