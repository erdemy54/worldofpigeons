/**
 * World of Pigeon's - Audio Manager
 * Procedural sound generation via Web Audio API.
 * All sounds synthesized at runtime — no audio files needed.
 * Uses window.AudioManager global.
 */
(function () {
  'use strict';

  /* ── State ── */
  var ctx = null;          // AudioContext (created on first user gesture)
  var masterGain = null;
  var sfxGain = null;
  var ambientGain = null;
  var enabled = true;
  var masterVolume = 0.7;
  var sfxVolume = 1.0;
  var ambientVolume = 0.3;
  var ambientNodes = {};   // currently playing ambient sounds

  /* ── Initialization ── */

  /**
   * Lazily create the AudioContext (must happen after user gesture).
   */
  function ensureContext() {
    if (ctx) return true;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) {
        console.warn('[AudioManager] Web Audio API not supported.');
        return false;
      }
      ctx = new AC();

      // Master gain → destination
      masterGain = ctx.createGain();
      masterGain.gain.value = masterVolume;
      masterGain.connect(ctx.destination);

      // SFX gain → master
      sfxGain = ctx.createGain();
      sfxGain.gain.value = sfxVolume;
      sfxGain.connect(masterGain);

      // Ambient gain → master
      ambientGain = ctx.createGain();
      ambientGain.gain.value = ambientVolume;
      ambientGain.connect(masterGain);

      return true;
    } catch (err) {
      console.error('[AudioManager] Failed to create AudioContext:', err);
      return false;
    }
  }

  /**
   * Resume context if suspended (browser autoplay policy).
   */
  function resumeContext() {
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
  }

  /* ── Helper: Create White Noise Buffer ── */
  function createNoiseBuffer(duration) {
    var sampleRate = ctx.sampleRate;
    var length = Math.floor(sampleRate * duration);
    var buffer = ctx.createBuffer(1, length, sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  /* ── Sound Definitions ── */

  /**
   * Pigeon coo sound: sine wave 200-300Hz with vibrato, ~1.5s
   */
  function playCoo() {
    if (!canPlay()) return;
    var now = ctx.currentTime;

    // Main tone
    var osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(250, now);
    osc.frequency.linearRampToValueAtTime(220, now + 0.4);
    osc.frequency.linearRampToValueAtTime(280, now + 0.7);
    osc.frequency.linearRampToValueAtTime(200, now + 1.2);
    osc.frequency.linearRampToValueAtTime(240, now + 1.5);

    // Vibrato LFO
    var lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 5;
    var lfoGain = ctx.createGain();
    lfoGain.gain.value = 15;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    // Envelope
    var env = ctx.createGain();
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(0.35, now + 0.08);
    env.gain.setValueAtTime(0.35, now + 0.3);
    env.gain.linearRampToValueAtTime(0.1, now + 0.5);
    env.gain.linearRampToValueAtTime(0.3, now + 0.7);
    env.gain.linearRampToValueAtTime(0.0, now + 1.5);

    osc.connect(env);
    env.connect(sfxGain);

    osc.start(now);
    lfo.start(now);
    osc.stop(now + 1.5);
    lfo.stop(now + 1.5);
  }

  /**
   * Wing flap: filtered noise burst, ~80ms
   */
  function playWingFlap() {
    if (!canPlay()) return;
    var now = ctx.currentTime;

    var buffer = createNoiseBuffer(0.08);
    var source = ctx.createBufferSource();
    source.buffer = buffer;

    var filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 800;
    filter.Q.value = 1.5;

    var env = ctx.createGain();
    env.gain.setValueAtTime(0.5, now);
    env.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    source.connect(filter);
    filter.connect(env);
    env.connect(sfxGain);

    source.start(now);
    source.stop(now + 0.08);
  }

  /**
   * Wing clap: sharp noise pop, ~120ms
   */
  function playWingClap() {
    if (!canPlay()) return;
    var now = ctx.currentTime;

    var buffer = createNoiseBuffer(0.12);
    var source = ctx.createBufferSource();
    source.buffer = buffer;

    var filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 2000;

    var env = ctx.createGain();
    env.gain.setValueAtTime(0.7, now);
    env.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    source.connect(filter);
    filter.connect(env);
    env.connect(sfxGain);

    source.start(now);
    source.stop(now + 0.12);
  }

  /**
   * Tumble whoosh: frequency sweep 400→200Hz, ~300ms
   */
  function playTumbleWhoosh() {
    if (!canPlay()) return;
    var now = ctx.currentTime;

    // Noise for whoosh body
    var noiseBuffer = createNoiseBuffer(0.3);
    var noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    var bpf = ctx.createBiquadFilter();
    bpf.type = 'bandpass';
    bpf.frequency.setValueAtTime(400, now);
    bpf.frequency.linearRampToValueAtTime(200, now + 0.3);
    bpf.Q.value = 3;

    var env = ctx.createGain();
    env.gain.setValueAtTime(0.0, now);
    env.gain.linearRampToValueAtTime(0.5, now + 0.05);
    env.gain.linearRampToValueAtTime(0.0, now + 0.3);

    noise.connect(bpf);
    bpf.connect(env);
    env.connect(sfxGain);

    noise.start(now);
    noise.stop(now + 0.3);
  }

  /**
   * Roll spin: repeating tone burst, ~0.5s
   */
  function playRollSpin() {
    if (!canPlay()) return;
    var now = ctx.currentTime;
    var count = 5;
    var gap = 0.1;

    for (var i = 0; i < count; i++) {
      var t = now + i * gap;
      var osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(350 + i * 30, t);

      var env = ctx.createGain();
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(0.3, t + 0.02);
      env.gain.linearRampToValueAtTime(0, t + gap * 0.9);

      osc.connect(env);
      env.connect(sfxGain);
      osc.start(t);
      osc.stop(t + gap);
    }
  }

  /**
   * Landing: lowpass noise sweep, ~200ms
   */
  function playLanding() {
    if (!canPlay()) return;
    var now = ctx.currentTime;

    var buffer = createNoiseBuffer(0.2);
    var source = ctx.createBufferSource();
    source.buffer = buffer;

    var lpf = ctx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.setValueAtTime(3000, now);
    lpf.frequency.exponentialRampToValueAtTime(200, now + 0.2);

    var env = ctx.createGain();
    env.gain.setValueAtTime(0.4, now);
    env.gain.linearRampToValueAtTime(0.0, now + 0.2);

    source.connect(lpf);
    lpf.connect(env);
    env.connect(sfxGain);

    source.start(now);
    source.stop(now + 0.2);
  }

  /**
   * Chick chirp: high sine 800-1200Hz, ~100ms
   */
  function playChickChirp() {
    if (!canPlay()) return;
    var now = ctx.currentTime;
    var startFreq = 800 + Math.random() * 400;

    var osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.linearRampToValueAtTime(startFreq + 200, now + 0.05);
    osc.frequency.linearRampToValueAtTime(startFreq - 100, now + 0.1);

    var env = ctx.createGain();
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(0.3, now + 0.01);
    env.gain.linearRampToValueAtTime(0, now + 0.1);

    osc.connect(env);
    env.connect(sfxGain);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  /**
   * Feed scatter: rapid clicks, ~300ms
   */
  function playFeedScatter() {
    if (!canPlay()) return;
    var now = ctx.currentTime;
    var clicks = 8;

    for (var i = 0; i < clicks; i++) {
      var t = now + i * 0.035 + Math.random() * 0.01;

      var noiseBuffer = createNoiseBuffer(0.015);
      var source = ctx.createBufferSource();
      source.buffer = noiseBuffer;

      var hpf = ctx.createBiquadFilter();
      hpf.type = 'highpass';
      hpf.frequency.value = 3000 + Math.random() * 2000;

      var env = ctx.createGain();
      env.gain.setValueAtTime(0.25 + Math.random() * 0.15, t);
      env.gain.exponentialRampToValueAtTime(0.001, t + 0.015);

      source.connect(hpf);
      hpf.connect(env);
      env.connect(sfxGain);

      source.start(t);
      source.stop(t + 0.015);
    }
  }

  /**
   * Coin collect: sine sweep 500→800Hz, ~200ms
   */
  function playCoin() {
    if (!canPlay()) return;
    var now = ctx.currentTime;

    var osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);

    var osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1000, now + 0.1);
    osc2.frequency.exponentialRampToValueAtTime(1200, now + 0.2);

    var env = ctx.createGain();
    env.gain.setValueAtTime(0.3, now);
    env.gain.linearRampToValueAtTime(0.2, now + 0.1);
    env.gain.linearRampToValueAtTime(0, now + 0.2);

    osc.connect(env);
    osc2.connect(env);
    env.connect(sfxGain);

    osc.start(now);
    osc.stop(now + 0.1);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.2);
  }

  /**
   * Success jingle: 3 ascending tones
   */
  function playSuccess() {
    if (!canPlay()) return;
    var now = ctx.currentTime;
    var notes = [523, 659, 784]; // C5, E5, G5
    var dur = 0.15;

    for (var i = 0; i < notes.length; i++) {
      var t = now + i * dur;
      var osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = notes[i];

      var env = ctx.createGain();
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(0.3, t + 0.02);
      env.gain.linearRampToValueAtTime(i === notes.length - 1 ? 0.15 : 0, t + dur);
      if (i === notes.length - 1) {
        env.gain.linearRampToValueAtTime(0, t + dur + 0.3);
      }

      osc.connect(env);
      env.connect(sfxGain);
      osc.start(t);
      osc.stop(t + dur + (i === notes.length - 1 ? 0.3 : 0));
    }
  }

  /**
   * Error sound: 2 descending tones
   */
  function playError() {
    if (!canPlay()) return;
    var now = ctx.currentTime;
    var notes = [400, 280];
    var dur = 0.15;

    for (var i = 0; i < notes.length; i++) {
      var t = now + i * dur;
      var osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.value = notes[i];

      var env = ctx.createGain();
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(0.2, t + 0.02);
      env.gain.linearRampToValueAtTime(0, t + dur);

      osc.connect(env);
      env.connect(sfxGain);
      osc.start(t);
      osc.stop(t + dur);
    }
  }

  /**
   * Hawk cry: sawtooth oscillator with vibrato, ~400ms
   */
  function playHawkCry() {
    if (!canPlay()) return;
    var now = ctx.currentTime;

    var osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1800, now);
    osc.frequency.linearRampToValueAtTime(1200, now + 0.15);
    osc.frequency.linearRampToValueAtTime(1600, now + 0.25);
    osc.frequency.linearRampToValueAtTime(900, now + 0.4);

    var lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 12;
    var lfoGain = ctx.createGain();
    lfoGain.gain.value = 50;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    var filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1400;
    filter.Q.value = 2;

    var env = ctx.createGain();
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(0.25, now + 0.03);
    env.gain.setValueAtTime(0.25, now + 0.15);
    env.gain.linearRampToValueAtTime(0, now + 0.4);

    osc.connect(filter);
    filter.connect(env);
    env.connect(sfxGain);

    osc.start(now);
    lfo.start(now);
    osc.stop(now + 0.4);
    lfo.stop(now + 0.4);
  }

  /**
   * Egg crack: noise burst with frequency drop, ~300ms
   */
  function playEggCrack() {
    if (!canPlay()) return;
    var now = ctx.currentTime;

    // Crack noise
    var noiseBuffer = createNoiseBuffer(0.3);
    var noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    var hpf = ctx.createBiquadFilter();
    hpf.type = 'highpass';
    hpf.frequency.setValueAtTime(4000, now);
    hpf.frequency.exponentialRampToValueAtTime(500, now + 0.3);

    var env = ctx.createGain();
    env.gain.setValueAtTime(0.5, now);
    env.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    // Tonal crack element
    var osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);

    var oscEnv = ctx.createGain();
    oscEnv.gain.setValueAtTime(0.3, now);
    oscEnv.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    noise.connect(hpf);
    hpf.connect(env);
    env.connect(sfxGain);

    osc.connect(oscEnv);
    oscEnv.connect(sfxGain);

    noise.start(now);
    noise.stop(now + 0.3);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  /**
   * UI click: sharp high tone, ~15ms
   */
  function playUIClick() {
    if (!canPlay()) return;
    var now = ctx.currentTime;

    var osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 2000;

    var env = ctx.createGain();
    env.gain.setValueAtTime(0.15, now);
    env.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

    osc.connect(env);
    env.connect(sfxGain);
    osc.start(now);
    osc.stop(now + 0.015);
  }

  /**
   * UI swipe: descending sweep, ~80ms
   */
  function playUISwipe() {
    if (!canPlay()) return;
    var now = ctx.currentTime;

    var osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1500, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);

    var env = ctx.createGain();
    env.gain.setValueAtTime(0.12, now);
    env.gain.linearRampToValueAtTime(0, now + 0.08);

    osc.connect(env);
    env.connect(sfxGain);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  /**
   * Ambient wind: continuous filtered noise loop.
   * Call once to start, use stopAmbientWind() to stop.
   */
  function startAmbientWind() {
    if (!canPlay()) return;
    if (ambientNodes.wind) return; // already playing

    // Create a long noise buffer and loop it
    var duration = 2;
    var buffer = createNoiseBuffer(duration);
    var source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Low pass for soft wind
    var lpf = ctx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.value = 600;
    lpf.Q.value = 0.5;

    // Subtle volume modulation
    var modOsc = ctx.createOscillator();
    modOsc.type = 'sine';
    modOsc.frequency.value = 0.15; // very slow
    var modGain = ctx.createGain();
    modGain.gain.value = 0.06;

    var windGain = ctx.createGain();
    windGain.gain.value = 0.12;

    modOsc.connect(modGain);
    modGain.connect(windGain.gain);

    source.connect(lpf);
    lpf.connect(windGain);
    windGain.connect(ambientGain);

    source.start();
    modOsc.start();

    ambientNodes.wind = {
      source: source,
      modOsc: modOsc,
      gain: windGain
    };
  }

  /**
   * Stop ambient wind sound.
   */
  function stopAmbientWind() {
    if (ambientNodes.wind) {
      try {
        ambientNodes.wind.source.stop();
        ambientNodes.wind.modOsc.stop();
      } catch (e) { /* ignore */ }
      ambientNodes.wind = null;
    }
  }

  /* ── Volume Controls ── */

  function setMasterVolume(v) {
    masterVolume = Math.max(0, Math.min(1, v));
    if (masterGain) masterGain.gain.value = masterVolume;
  }

  function setSfxVolume(v) {
    sfxVolume = Math.max(0, Math.min(1, v));
    if (sfxGain) sfxGain.gain.value = sfxVolume;
  }

  function setAmbientVolume(v) {
    ambientVolume = Math.max(0, Math.min(1, v));
    if (ambientGain) ambientGain.gain.value = ambientVolume;
  }

  function setEnabled(val) {
    enabled = !!val;
    if (!enabled) {
      stopAmbientWind();
    }
    if (window.EventBus && window.EventBus.emit) {
      window.EventBus.emit(
        (window.EventBus.Events && window.EventBus.Events.AUDIO_TOGGLE) || 'system:audioToggle',
        enabled
      );
    }
  }

  function isEnabled() {
    return enabled;
  }

  /* ── Guard ── */
  function canPlay() {
    if (!enabled) return false;
    if (!ensureContext()) return false;
    resumeContext();
    return true;
  }

  /* ── Sound Map for generic play(name) ── */
  var soundMap = {
    coo: playCoo,
    wing_flap: playWingFlap,
    wing_clap: playWingClap,
    tumble_whoosh: playTumbleWhoosh,
    roll_spin: playRollSpin,
    landing: playLanding,
    chick_chirp: playChickChirp,
    feed_scatter: playFeedScatter,
    coin: playCoin,
    success: playSuccess,
    error: playError,
    hawk_cry: playHawkCry,
    egg_crack: playEggCrack,
    ui_click: playUIClick,
    ui_swipe: playUISwipe
  };

  /**
   * Play a sound by name.
   * @param {string} name - One of the sound map keys.
   */
  function play(name) {
    var fn = soundMap[name];
    if (fn) {
      fn();
    } else {
      console.warn('[AudioManager] Unknown sound:', name);
    }
  }

  /**
   * Initialize audio system. Call after first user gesture.
   */
  function init() {
    ensureContext();
    resumeContext();
  }

  /* ── Public API ── */
  window.AudioManager = {
    init: init,
    play: play,

    // Direct sound methods
    playCoo: playCoo,
    playWingFlap: playWingFlap,
    playWingClap: playWingClap,
    playTumbleWhoosh: playTumbleWhoosh,
    playRollSpin: playRollSpin,
    playLanding: playLanding,
    playChickChirp: playChickChirp,
    playFeedScatter: playFeedScatter,
    playCoin: playCoin,
    playSuccess: playSuccess,
    playError: playError,
    playHawkCry: playHawkCry,
    playEggCrack: playEggCrack,
    playUIClick: playUIClick,
    playUISwipe: playUISwipe,

    // Ambient
    startAmbientWind: startAmbientWind,
    stopAmbientWind: stopAmbientWind,

    // Volume / settings
    setMasterVolume: setMasterVolume,
    setSfxVolume: setSfxVolume,
    setAmbientVolume: setAmbientVolume,
    setEnabled: setEnabled,
    isEnabled: isEnabled,

    /** List of available sound names */
    sounds: Object.keys(soundMap)
  };
})();
