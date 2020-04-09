import { play, noise, score, Envelope, wave, gameOver, melody } from "./sfx-helpers";
import * as song from "../assets/song.json";

export class Sfx {
    music() {
        const speed = 280;
        play("song-1", melody(speed, song.tracks[0].notes /* bass */ as any[]), 1000, new Envelope(0, 0, 1, 0.5), 0.1);
        play("song-2", melody(speed, song.tracks[1].notes /* lead */ as any[]), 1000, new Envelope(0, 0, 1, 0.5), 0.1);
    }

    move() {
        play("action", wave(440), 0.1, new Envelope(0, 0, 1, 0.1));
    }

    drop() {
        play("action", noise(), 0.5, new Envelope(0, 0, 1, 0.5));
    }

    rotate() {
        play("action", wave(440 * 3 / 2), 0.1, new Envelope(0, 0, 1, 0.1));
    }

    scored() {
        play("scored", score(0.6), 0.6, new Envelope(0, 0.1, 0.8, 0.2));
    }

    gameOver() {
        play("gameover", gameOver(1.5), 1.5, new Envelope(0, 0.1, 0.8, 0.2));
    }
}
