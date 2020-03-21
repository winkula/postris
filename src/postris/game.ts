import { Renderer } from "./renderer";
import { Board } from "./board";
import { tetriminos } from "./piece";
import { choice } from "./helpers";

enum DirectionX {
    Left = -1,
    Right = 1
}

enum DirectionY {
    Up = 1,
    Down = -1
}

enum KeyCode {
    Left = 37,
    Up = 38,
    Right = 39,
    Down = 40,
    Space = 32,
}

enum Action {
    RotateCw,
    RotateCcw,
    Left,
    Right,
    Down,
    Drop  
}

interface ActionMap {
    [key: number]: Function | null;
}

export class Game {
    board: Board;
    renderer: Renderer;
    dimensions: number[];
    actionMap!: ActionMap;
    speed: number = 1000 / 1.5;

    constructor() {
        this.board = new Board();
        this.dimensions = [10, 10];
        this.renderer = new Renderer();
        this.renderer.init();
        this.actionMap = {
            [KeyCode.Left]: () => this.move(DirectionX.Left),
            [KeyCode.Right]: () => this.move(DirectionX.Right),
            [KeyCode.Down]: () => this.fall(),
            [KeyCode.Space]: () => this.drop(),
            [KeyCode.Up]: () => this.elapsed(),
        }
    }

    run() {
        this.init();
        this.loop();
    }

    init() {
        this.spawn();
        window.addEventListener("keydown", event => {
            const action = this.actionMap[event.keyCode];
            if (action) {
                action();
            }
        });
        setInterval(() => {
            //this.elapsed();
        }, this.speed);
    }

    loop() {
        this.update();
        this.render();
        window.requestAnimationFrame(this.loop.bind(this));
    }

    spawn() {
        const tetrimino = choice(tetriminos);
        this.board.newPiece(tetrimino);
    }

    move(direction: number) {
        this.board.current?.move(direction);
    }

    elapsed() {
        console.log("Elapsed");
        this.board.current?.fall();
        this.checkCollision();
    }

    fall() {
        console.log("Fall");
        this.board.current?.fall();
        this.checkCollision();
    }

    rotate(direction: boolean) {
        console.log("Rotate");
        // TODO
        this.checkCollision();
    }

    drop() {
        console.log("Drop");
        // TODO
        this.checkCollision();
    }

    checkCollision() {
        if (this.board.current?.isLanded()) {
            console.log("Placed");
            this.board.place();
        }
    }

    update() {
    }

    render() {
        this.renderer.clear();
        this.board.render(this.renderer);
        this.renderer.debug(this);
    }
}
