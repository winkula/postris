import { Renderer } from "./renderer";
import { Board } from "./board"; 

enum TetriminoType {
    O = 0,
    I = 1,
    S = 2,
    Z = 3,
    L = 4,
    J = 5,
    T = 6
}

export class Tetrimino {

}

export class Game {
    board: Board;
    dimensions: number[];

    constructor() {
        this.board = new Board();
        this.dimensions = [10, 10];
        const renderer = new Renderer();
        renderer.init();
    }

    run() {
        window.requestAnimationFrame(this.loop);
    }

    loop() {
        //window.requestAnimationFrame(this.loop);
    }
}
