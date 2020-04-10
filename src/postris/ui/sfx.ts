import { play, stop, noise, score, Envelope, wave, melody } from "./sfx-helpers";
import * as song from "../assets/song.json";

export class Sfx {
    playing = false;
    level: number;

    constructor(level: number) {
        this.level = level;
    }

    async startMusic() {
        this.playing = true;
        while (this.playing) {
            const speed = Math.sqrt(this.level);
            await play("music", melody([song.bass, song.lead], "square", speed), 0.2);
        }
    }

    stopMusic() {
        this.playing = false;
        stop("music");
    }

    move() {
        play("action", wave(440, 0.1), 1, new Envelope(0, 0, 1, 0.1));
    }

    drop() {
        play("action", noise(0.5), 0.8, new Envelope(0, 0, 1, 0.5));
    }

    rotate() {
        play("action", wave(440 * 3 / 2, 0.1), 1, new Envelope(0, 0, 1, 0.1));
    }

    scored(lineCount: number) {
        play("scored", score(0.6, lineCount), 1, new Envelope(0, 0.1, 0.8, 0.2));
    }

    gameOver() {
        const notes = [
            { time: 0, duration: 2, midi: 64, velocity: 0.5 },
            { time: 3, duration: 2, midi: 63, velocity: 0.7 },
            { time: 6, duration: 2, midi: 62, velocity: 0.9 },
            { time: 9, duration: 6, midi: 61, velocity: 1.0 }
        ];
        play("gameover", melody([notes], "sawtooth", 6), 0.6);
    }
}
