import {
  play,
  stop,
  noise,
  score,
  Envelope,
  wave,
  melody,
  isAvailable,
} from "./sfx-helpers";
import * as song from "../assets/song.json";
import { wait } from "../helpers";

const gameOverNotes = [
  { time: 0, duration: 2, midi: 64, velocity: 0.5 },
  { time: 3, duration: 2, midi: 63, velocity: 0.7 },
  { time: 6, duration: 2, midi: 62, velocity: 0.9 },
  { time: 9, duration: 6, midi: 61, velocity: 1.0 },
];

export class Sfx {
  private playing = false;
  private level: number;

  constructor(level: number) {
    this.level = level;
  }

  async startMusic() {
    if (!isAvailable()) {
      return;
    }
    this.playing = true;
    while (this.playing) {
      const speed = Math.sqrt(0.4 + 0.6 * this.level);
      await play("music", melody([song.bass, song.lead], "square", speed), 0.2);
    }
  }

  stopMusic() {
    if (!isAvailable()) {
      return;
    }
    this.playing = false;
    stop("music");
  }

  move() {
    if (!isAvailable()) {
      return;
    }
    play("action", wave(440, 0.1), 1, new Envelope(0, 0, 1, 0.1));
  }

  drop() {
    if (!isAvailable()) {
      return;
    }
    play("action", noise(0.5), 0.8, new Envelope(0, 0, 1, 0.7));
  }

  rotate() {
    if (!isAvailable()) {
      return;
    }
    play("action", wave((440 * 3) / 2, 0.1), 1, new Envelope(0, 0, 1, 0.1));
  }

  scored(lineCount: number, level: number) {
    if (!isAvailable()) {
      return;
    }
    this.level = level;
    play("scored", score(0.6, lineCount), 1, new Envelope(0, 0.1, 0.8, 0.2));
  }

  async gameOver() {
    if (!isAvailable()) {
      return;
    }
    await wait(150);
    play("gameover", melody([gameOverNotes], "sawtooth", 6.5), 0.6);
  }
}
