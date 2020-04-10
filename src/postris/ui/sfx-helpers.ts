const AudioContext = window.AudioContext || (<any>window).webkitAudioContext;
const ctx = new AudioContext();
const noiseBuffer = createNoiseBuffer(1, 90);
const playing: PlayingMap = {};

interface PlayingMap {
    [key: string]: Playable | undefined;
}

interface Playable {
    duration: number;
    start: (target: AudioNode, onended: () => void) => void;
    stop: () => void;
}

interface Note {
    time: number;
    duration: number;
    midi: number;
}

interface PulseOscillatorNode extends OscillatorNode {
    width: AudioParam;
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

//Pre-calculate the WaveShaper curves so that we can reuse them.
var pulseCurve = new Float32Array(256);
for (var i = 0; i < 128; i++) {
    pulseCurve[i] = -1;
    pulseCurve[i + 128] = 1;
}
var constantOneCurve = new Float32Array(2);
constantOneCurve[0] = 1;
constantOneCurve[1] = 1;

//Add a new factory method to the AudioContext object.
function createPulseOscillator() {
    //Use a normal oscillator as the basis of our new oscillator.
    var node = ctx.createOscillator() as PulseOscillatorNode;
    node.type = "sawtooth";

    //Shape the output into a pulse wave.
    var pulseShaper = ctx.createWaveShaper();
    pulseShaper.curve = pulseCurve;
    node.connect(pulseShaper);

    //Use a GainNode as our new "width" audio parameter.
    var widthGain = ctx.createGain();
    widthGain.gain.value = 0; //Default width.
    node.width = widthGain.gain; //Add parameter to oscillator node.
    widthGain.connect(pulseShaper);

    //Pass a constant value of 1 into the widthGain – so the "width" setting
    //is duplicated to its output.
    var constantOneShaper = ctx.createWaveShaper();
    constantOneShaper.curve = constantOneCurve;
    node.connect(constantOneShaper);
    constantOneShaper.connect(widthGain);

    //Override the oscillator's "connect" and "disconnect" method so that the
    //new node's output actually comes from the pulseShaper.
    (node as any).connect = (target: AudioNode) => {
        console.log(target);
        console.log(arguments);
        pulseShaper.connect.apply(pulseShaper, [target as any]);
    }
    node.disconnect = () => {
        pulseShaper.disconnect.apply(pulseShaper, arguments as any);
    }

    return node;
}

export function noise(duration: number) {
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    return <Playable>{
        duration: duration,
        start: (target: AudioNode, onended: () => void) => {
            noise.onended = onended;
            noise.connect(target);
            noise.start();
        },
        stop: () => noise.stop(),
    }
}

export function wave(frequency: number, duration: number) {
    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    return <Playable>{
        duration: duration,
        start: (target: AudioNode, onended: () => void) => {
            osc.onended = onended;
            osc.connect(target);
            osc.start();
        },
        stop: () => osc.stop()
    }
}

export function score(duration: number, lines: number = 1) {
    const osc = ctx.createOscillator();
    osc.type = "square";
    modulate(osc.frequency, duration, 40, (i, f) => (100 + f * 200 * lines) * Math.pow(2, i % 3));

    return <Playable>{
        duration: duration,
        start: (target: AudioNode, onended: () => void) => {
            osc.onended = onended;
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
        start: (target: AudioNode, onended: () => void) => {
            osc.onended = onended;
            osc.connect(target);
            osc.start();
        },
        stop: () => osc.stop()
    }
}

export function melody(notes: any[], speed: number = 1) {
    const adjustTime = (t: number) => t / speed;

    const osc = ctx.createOscillator();
    //const osc = createPulseOscillator();
    //osc.width.setValueAtTime(0.2, ctx.currentTime);
    //osc.width.linearRampToValueAtTime(0.9, ctx.currentTime + 3);
    osc.type = "square";

    let length = 0;
    for (const note of notes) {
        const time = adjustTime(note.time);
        const duration = adjustTime(note.duration);
        const freq = 440 * Math.pow(2, (note.midi - 69) / 12);
        length = Math.max(duration, time + duration);
        osc.frequency.setValueAtTime(freq, ctx.currentTime + time);
    }

    return <Playable>{
        duration: length,
        start: (target: AudioNode, onended: () => void) => {
            osc.onended = onended;
            osc.connect(target);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + length);
        },
        stop: () => osc.stop()
    }
}

export async function play(key: string, sound: Playable, envelope = new Envelope(0, 0, 1, 0), volume: number = 1) {
    return new Promise(resolve => {
        playing[key]?.stop();

        const amp = ctx.createGain();
        applyEnvelope(amp.gain, volume, sound.duration, envelope);
        amp.connect(ctx.destination);

        sound.start(amp, resolve);

        playing[key] = sound;
    });
}

export function stop(key: string) {
    playing[key]?.stop();
}
