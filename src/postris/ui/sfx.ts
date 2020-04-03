import * as gbs from "gameboy-sound";

export class Sfx {
    play() {
        // TODO: play background sound
    }

    move() {
        gbs.play(0, [
            { freq: gbs.C6, volume: 10, fade: 0.5 },
            1,
          ]);
    }

    fall() {
        
    }
    
    drop() {
        gbs.play(3, [
            { freq: 7<<10, volume: 6, fade: 5 },
            5,
          ]);
    }

    rotate() {
        gbs.play(0, [
            { freq: gbs.F5, volume: 10, fade: 0.5 },
            1,
          ]);
    }
}
