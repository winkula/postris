const AudioContext = window.AudioContext || (<any>window).webkitAudioContext;
const ctx = new AudioContext();
const noiseBuffer = createNoiseBuffer(1, 90);
const playing: PlayingMap = {};

interface PlayingMap {
    [key: string]: Playable | undefined;
}

interface Playable {
    duration?: number;
    start: (target: AudioNode) => void;
    stop: () => void;
}

export class Envelope {
    attack: number;
    decay: number;
    sustain: number;
    release: number;

    constructor(attack: number, decay: number, sustain: number, release: number) {
        this.attack = attack;
        this.decay = decay;
        this.sustain = sustain;
        this.release = release;
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
    function random(seed: number) {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    }
    function bitcrush(value: number, steps: number) {
        return Math.floor(value * steps) / steps;
    }
    return createAudioBuffer(length, i => {
        const index = Math.floor(i / repeat);
        const value = random(index);
        const bitcrushed = bitcrush(value, 256);
        const normalized = bitcrushed * 2 - 1;
        return normalized;
    });
}

function applyEnvelope(param: AudioParam, volume: number, duration: number, envelope: Envelope) {
    param.cancelScheduledValues(ctx.currentTime);
    param.setValueAtTime(0, ctx.currentTime);
    param.linearRampToValueAtTime(volume, ctx.currentTime + envelope.attack);
    param.linearRampToValueAtTime(volume * envelope.sustain, ctx.currentTime + envelope.attack + envelope.decay);
    param.setValueAtTime(volume * envelope.sustain, ctx.currentTime + Math.max(0, duration - envelope.release));
    param.linearRampToValueAtTime(0, ctx.currentTime + duration);
}

function modulate(target: AudioParam, duration: number, resolution: number, value: (i: number, f: number) => number) {
    for (let i = 0; i < resolution; i++) {
        const factor = i / resolution;
        target.setValueAtTime(value(i, factor), ctx.currentTime + factor * duration);
    }
}

export function noise() {
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    return <Playable>{
        start: (target: AudioNode) => {
            noise.connect(target);
            noise.start();
        },
        stop: () => noise.stop()
    }
}

export function wave(frequency: number) {
    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    return <Playable>{
        start: (target: AudioNode) => {
            osc.connect(target);
            osc.start();
        },
        stop: () => osc.stop()
    }
}

export function score(duration: number) {
    const osc = ctx.createOscillator();
    osc.type = "square";
    modulate(osc.frequency, duration, 40, (i, f) => (100 + f * 800) * Math.pow(2, i % 3));

    return <Playable>{
        duration: duration,
        start: (target: AudioNode) => {
            osc.connect(target);
            osc.start();
        },
        stop: () => osc.stop()
    }
}

export function gameOver(duration: number) {
    const osc = ctx.createOscillator();
    osc.type = "square";
    const steps = 80;
    modulate(osc.frequency, duration, steps, (i, f) => (800 + 50 * (-f * 0.3 - Math.floor(i / (steps / 4)))) * Math.pow(2, Math.floor(i / 2) % 2));

    return <Playable>{
        duration: duration,
        start: (target: AudioNode) => {
            osc.connect(target);
            osc.start();
        },
        stop: () => osc.stop()
    }
}

export function melody(speed: number, notes: any[]) {
    const osc = ctx.createOscillator();
    osc.type = "square";

/*
    for (let i = 0; i < notes.length / 3; i += 3) {
        const time = notes[i] / speed;
        const duration = notes[i + 1] / speed;
        const freq = 440 * Math.pow(2, (notes[i + 2] - 69) / 12);
        osc.frequency.setValueAtTime(freq, ctx.currentTime + time);
    }*/

    
    for (const note of notes) {
        const freq = 440 * Math.pow(2, (note.midi - 69) / 12);
        const time = note.time;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + time);
    }

    return <Playable>{
        start: (target: AudioNode) => {
            osc.connect(target);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 16);
        },
        stop: () => osc.stop()
    }
}

export function play(key: string, sound: Playable, duration: number = 1, envelope = new Envelope(0, 0, 1, 0), volume: number = 1) {
    playing[key]?.stop();

    const amp = ctx.createGain();
    applyEnvelope(amp.gain, volume, duration, envelope);

    amp.connect(ctx.destination)
    sound.start(amp);

    playing[key] = sound;
}
