import { play, stop, noise, score, Envelope, wave, gameOver, melody } from "./sfx-helpers";
import * as song from "../assets/song.json";

export class Sfx {
    running: boolean = true;
    level: number = 1;

    async startMusic() {
        while (this.running) {
            await Promise.all([
                play("song-1", melody(song.bass, 1), new Envelope(0, 0, 1, 0.5), 0.1),
                play("song-2", melody(song.lead, 1), new Envelope(0, 0, 1, 0.5), 0.1)
            ]);
        }
    }

    stopMusic() {
        this.running = false;
        stop("song-1");
        stop("song-2");
    }

    move() {
        play("action", wave(440, 0.1), new Envelope(0, 0, 1, 0.1));
    }

    drop() {
        play("action", noise(0.5), new Envelope(0, 0, 1, 0.5));
    }

    rotate() {
        play("action", wave(440 * 3 / 2, 0.1), new Envelope(0, 0, 1, 0.1));
    }

    scored(lineCount: number) {
        play("scored", score(0.6, lineCount), new Envelope(0, 0.1, 0.8, 0.2));
    }

    gameOver() {
        const notes = [
            { time: 0, duration: 2, midi: 76, },
            { time: 3, duration: 2, midi: 75, },
            { time: 6, duration: 2, midi: 74, },
            { time: 9, duration: 6, midi: 73, }
        ];
        play("gameover", melody(notes, 6), new Envelope(0, 0, 1, 0.5), 0.5);
    }
}
