const ctx: AudioContext = createAudioContext()!;
const playing: PlayingMap = {};
let noiseBuffer: AudioBuffer | undefined;

interface PlayingMap {
  [key: string]: Playable | undefined;
}

interface Playable {
  duration: number;
  start: (target: AudioNode, onended: (value: unknown) => void) => void;
  stop: () => void;
}

interface Note {
  time: number;
  duration: number;
  midi: number;
  velocity?: number;
}

interface TrackNodes {
  source: OscillatorNode;
  amp: GainNode;
}

export class Envelope {
  attack: number;
  decay: number;
  sustain: number;
  release: number;

  constructor(
    attack: number = 0,
    decay: number = 0,
    sustain: number = 1,
    release: number = 0
  ) {
    this.attack = attack;
    this.decay = decay;
    this.sustain = sustain;
    this.release = release;
  }
}

function createAudioContext() {
  try {
    const AudioContext =
      window.AudioContext || (<any>window).webkitAudioContext;
    const ctx = new AudioContext();
    return ctx;
  } catch (error) {
    console.warn("AudioContext is not supported in this browser.");
    return undefined;
  }
}

function createAudioBuffer(length: number, factory: (i: number) => number) {
  const bufferSize = ctx.sampleRate * length;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  let data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = factory(i);
  }
  return buffer;
}

function createNoiseBuffer(length: number, repeat: number) {
  const random = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };
  const normalize = (x: number) => x * 2 - 1;
  const bitcrush = (value: number, steps: number) =>
    Math.floor(value * steps) / steps;
  noiseBuffer = createAudioBuffer(length, (i) =>
    normalize(bitcrush(random(Math.floor(i / repeat)), 256))
  );
  return noiseBuffer;
}

function applyEnvelope(
  param: AudioParam,
  volume: number,
  duration: number,
  now: number,
  envelope: Envelope
) {
  param.setValueAtTime(0, now);
  param.linearRampToValueAtTime(volume, now + envelope.attack);
  param.linearRampToValueAtTime(
    volume * envelope.sustain,
    now + envelope.attack + envelope.decay
  );
  param.setValueAtTime(
    volume * envelope.sustain,
    now + Math.max(0, duration - envelope.release)
  );
  param.linearRampToValueAtTime(0, now + duration);
}

function modulate(
  target: AudioParam,
  duration: number,
  resolution: number,
  now: number,
  value: (i: number, f: number) => number
) {
  for (let i = 0; i < resolution; i++) {
    const factor = i / resolution;
    target.setValueAtTime(value(i, factor), now + factor * duration);
  }
}

export function noise(duration: number) {
  const noise = ctx.createBufferSource();
  noise.buffer = createNoiseBuffer(1, 90);

  return <Playable>{
    duration: duration,
    start: (target: AudioNode, onended: () => void) => {
      noise.onended = onended;
      noise.connect(target);
      noise.start();
    },
    stop: () => noise.stop(),
  };
}

export function wave(frequency: number, duration: number) {
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = "square";
  osc.frequency.setValueAtTime(frequency, now);

  return <Playable>{
    duration: duration,
    start: (target: AudioNode, onended: () => void) => {
      osc.onended = onended;
      osc.connect(target);
      osc.start();
    },
    stop: () => osc.stop(),
  };
}

export function score(duration: number, lines: number = 1) {
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = "square";
  modulate(
    osc.frequency,
    duration,
    40,
    now,
    (i, f) => (100 + f * 200 * lines) * Math.pow(2, i % 3)
  );

  return <Playable>{
    duration: duration,
    start: (target: AudioNode, onended: () => void) => {
      osc.onended = onended;
      osc.connect(target);
      osc.start();
    },
    stop: () => osc.stop(),
  };
}

export function gameOver(duration: number) {
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = "square";
  const steps = 80;
  modulate(
    osc.frequency,
    duration,
    steps,
    now,
    (i, f) =>
      (800 + 50 * (-f * 0.3 - Math.floor(i / (steps / 4)))) *
      Math.pow(2, Math.floor(i / 2) % 2)
  );

  return <Playable>{
    duration: duration,
    start: (target: AudioNode, onended: () => void) => {
      osc.onended = onended;
      osc.connect(target);
      osc.start();
    },
    stop: () => osc.stop(),
  };
}

export function melody(
  tracks: Note[][],
  type: OscillatorType,
  speed: number = 1
) {
  const now = ctx.currentTime;

  const adjustTime = (t: number) => t / speed;
  const trackNodes: TrackNodes[] = [];
  let length = 0;

  for (const track of tracks) {
    const source = ctx.createOscillator();
    source.type = type;
    const amp = ctx.createGain();

    for (const note of track) {
      const time = adjustTime(note.time);
      const duration = adjustTime(note.duration);
      const freq = 440 * Math.pow(2, (note.midi - 69) / 12);
      length = Math.max(duration, time + duration);
      source.frequency.setValueAtTime(freq, now + time);

      amp.gain.setValueAtTime(0, now + time);
      amp.gain.linearRampToValueAtTime(
        note.velocity ?? 1,
        now + time + Math.min(0.01, duration * 0.9)
      );
      amp.gain.linearRampToValueAtTime(0, now + time + duration * 0.9);
    }

    trackNodes.push({ source, amp });
  }

  let running = trackNodes.length;

  return <Playable>{
    duration: length,
    start: (target: AudioNode, onended: () => void) => {
      for (const trackNode of trackNodes) {
        trackNode.source.onended = () => {
          if (--running <= 0) {
            onended();
          }
        };
        trackNode.source.connect(trackNode.amp).connect(target);
        trackNode.source.start(now);
        trackNode.source.stop(now + length);
      }
    },
    stop: () => {
      for (const trackNode of trackNodes) {
        trackNode.source.stop();
        trackNode.amp.disconnect();
      }
    },
  };
}

export async function play(
  key: string,
  sound: Playable,
  volume: number = 1,
  envelope = new Envelope()
) {
  return new Promise((resolve) => {
    playing[key]?.stop();

    const amp = ctx.createGain();
    const now = ctx.currentTime;
    applyEnvelope(amp.gain, volume, sound.duration, now, envelope);
    amp.connect(ctx.destination);

    sound.start(amp, resolve);

    playing[key] = sound;
  });
}

export function stop(key: string) {
  playing[key]?.stop();
}

export function isAvailable() {
  return ctx !== undefined;
}
