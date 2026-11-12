// Audio synthesizer using Web Audio API (Page turns, cute chimes, and soft background music box melody)

class SoundController {
  constructor() {
    this.ctx = null;
    this.effectsMuted = false;
    this.musicPlaying = false;
    this.musicTimer = null;
    this.musicStartTime = 0;
    this.initAudioContext();

    // Standard musical pitch frequencies
    this.noteFreqs = {
      'E2': 82.41, 'F#2': 92.50, 'G2': 98.00, 'A2': 110.00, 'B2': 123.47,
      'C#3': 138.59, 'D3': 146.83, 'E3': 164.81, 'F#3': 185.00, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
      'C#4': 277.18, 'D4': 293.66, 'E4': 329.63, 'F#4': 369.99, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
      'C#5': 554.37, 'D5': 587.33, 'E5': 659.25, 'F#5': 739.99, 'G5': 783.99, 'A5': 880.00
    };

    // 32-second gentle music box lullaby loop (Warm D Major)
    this.melody = [
      // Measure 1: Dmaj9
      { n: 'D3', t: 0.0, v: 0.045 }, { n: 'A3', t: 0.5, v: 0.035 }, { n: 'F#4', t: 1.0, v: 0.04 },
      { n: 'A4', t: 1.5, v: 0.04 }, { n: 'C#5', t: 2.0, v: 0.05 }, { n: 'A4', t: 2.6, v: 0.035 }, { n: 'F#4', t: 3.2, v: 0.035 },

      // Measure 2: Bm9
      { n: 'B2', t: 4.0, v: 0.045 }, { n: 'F#3', t: 4.5, v: 0.035 }, { n: 'D4', t: 5.0, v: 0.04 },
      { n: 'F#4', t: 5.5, v: 0.04 }, { n: 'B4', t: 6.0, v: 0.05 }, { n: 'A4', t: 6.6, v: 0.04 }, { n: 'F#4', t: 7.2, v: 0.035 },

      // Measure 3: Gmaj7
      { n: 'G2', t: 8.0, v: 0.045 }, { n: 'D3', t: 8.5, v: 0.035 }, { n: 'B3', t: 9.0, v: 0.04 },
      { n: 'D4', t: 9.5, v: 0.04 }, { n: 'F#4', t: 10.0, v: 0.05 }, { n: 'G4', t: 10.6, v: 0.045 }, { n: 'D4', t: 11.2, v: 0.035 },

      // Measure 4: A7sus4 -> A
      { n: 'A2', t: 12.0, v: 0.045 }, { n: 'E3', t: 12.5, v: 0.035 }, { n: 'A3', t: 13.0, v: 0.04 },
      { n: 'C#4', t: 13.5, v: 0.04 }, { n: 'E4', t: 14.0, v: 0.045 }, { n: 'G4', t: 14.6, v: 0.04 }, { n: 'F#4', t: 15.1, v: 0.04 }, { n: 'E4', t: 15.6, v: 0.035 },

      // Measure 5: F#m7
      { n: 'F#2', t: 16.0, v: 0.045 }, { n: 'C#3', t: 16.5, v: 0.035 }, { n: 'A3', t: 17.0, v: 0.04 },
      { n: 'C#4', t: 17.5, v: 0.04 }, { n: 'E4', t: 18.0, v: 0.05 }, { n: 'A4', t: 18.6, v: 0.045 }, { n: 'C#4', t: 19.2, v: 0.035 },

      // Measure 6: Bm7
      { n: 'B2', t: 20.0, v: 0.045 }, { n: 'F#3', t: 20.5, v: 0.035 }, { n: 'D4', t: 21.0, v: 0.04 },
      { n: 'F#4', t: 21.5, v: 0.04 }, { n: 'A4', t: 22.0, v: 0.05 }, { n: 'B4', t: 22.6, v: 0.045 }, { n: 'F#4', t: 23.2, v: 0.035 },

      // Measure 7: Em9
      { n: 'E2', t: 24.0, v: 0.045 }, { n: 'B2', t: 24.5, v: 0.035 }, { n: 'G3', t: 25.0, v: 0.04 },
      { n: 'B3', t: 25.5, v: 0.04 }, { n: 'D4', t: 26.0, v: 0.05 }, { n: 'F#4', t: 26.6, v: 0.045 }, { n: 'G4', t: 27.2, v: 0.04 },

      // Measure 8: Asus4 -> A (sparkling music box finish)
      { n: 'A2', t: 28.0, v: 0.045 }, { n: 'E3', t: 28.5, v: 0.035 }, { n: 'A3', t: 29.0, v: 0.04 },
      { n: 'C#4', t: 29.5, v: 0.04 }, { n: 'E4', t: 30.0, v: 0.045 }, { n: 'A4', t: 30.5, v: 0.045 }, { n: 'C#5', t: 31.0, v: 0.05 }, { n: 'E5', t: 31.4, v: 0.04 }
    ];
    this.loopDuration = 32.0;
  }

  initAudioContext() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      this.ctx = new AudioContext();
    }
  }

  resumeContext() {
    if (!this.ctx) {
      this.initAudioContext();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /* =========================================
     BACKGROUND MUSIC: SOFT MUSIC BOX LULLABY
  ========================================= */
  toggleMusic() {
    this.resumeContext();
    if (this.musicPlaying) {
      this.stopMusic();
      return false;
    } else {
      this.startMusic();
      return true;
    }
  }

  startMusic() {
    this.resumeContext();
    if (!this.ctx || this.musicPlaying) return;

    this.musicPlaying = true;
    this.scheduleMusicLoop();

    // Repeat schedule loop every (loopDuration - 0.2) seconds
    this.musicTimer = setInterval(() => {
      if (this.musicPlaying) {
        this.scheduleMusicLoop();
      }
    }, (this.loopDuration - 0.2) * 1000);
  }

  stopMusic() {
    this.musicPlaying = false;
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  scheduleMusicLoop() {
    if (!this.ctx || !this.musicPlaying) return;
    const baseTime = this.ctx.currentTime + 0.05;

    this.melody.forEach(item => {
      const freq = this.noteFreqs[item.n];
      if (freq) {
        this.playMusicBoxNote(freq, baseTime + item.t, item.v);
      }
    });
  }

  // Crystalline music box bell tone
  playMusicBoxNote(freq, startTime, vol = 0.04) {
    if (!this.ctx) return;
    try {
      const now = startTime;

      // 1. Fundamental chime
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(vol, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 1.85);

      // 2. High sparkle harmonic (gives that genuine music-box bell tink)
      if (freq > 200) {
        const overtone = this.ctx.createOscillator();
        const overGain = this.ctx.createGain();

        overtone.type = 'sine';
        overtone.frequency.setValueAtTime(freq * 2.756, now);

        overGain.gain.setValueAtTime(0, now);
        overGain.gain.linearRampToValueAtTime(vol * 0.25, now + 0.005);
        overGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

        overtone.connect(overGain);
        overGain.connect(this.ctx.destination);

        overtone.start(now);
        overtone.stop(now + 0.65);
      }
    } catch (e) {}
  }

  /* =========================================
     SOUND EFFECTS: PAGE TURNS & INTERACTIONS
  ========================================= */
  toggleEffects() {
    this.effectsMuted = !this.effectsMuted;
    return !this.effectsMuted;
  }

  playPageTurn() {
    if (this.effectsMuted) return;
    this.resumeContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.16;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.frequency.exponentialRampToValueAtTime(450, now + 0.15);
      filter.Q.setValueAtTime(2.2, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.14, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.16);

      this.playSoftNote(587.33, 0.04, 0.03);
    } catch (e) {}
  }

  playSoftNote(freq, startDelay = 0, volume = 0.06) {
    if (this.effectsMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime + startDelay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(volume, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch (e) {}
  }

  playPop() {
    if (this.effectsMuted) return;
    this.resumeContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.09);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {}
  }

  playHappyPurr() {
    if (this.effectsMuted) return;
    this.resumeContext();
    if (!this.ctx) return;
    try {
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        this.playSoftNote(freq, i * 0.07, 0.04);
      });
    } catch (e) {}
  }
}

window.soundCtrl = new SoundController();
