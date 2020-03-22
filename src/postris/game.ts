import { Renderer } from "./renderer";
import { State } from "./state";

enum DirectionX {
    Left = -1,
    Right = 1
}

enum DirectionY {
    Up = 1,
    Down = -1
}

enum Rotation {
    Ccw = -1,
    Cw = 1
}

enum KeyCode {
    Left = 37,
    Up = 38,
    Right = 39,
    Down = 40,
    Space = 32,
    Y = 89,
    X = 88
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
    state: State;
    renderer: Renderer;
    dimensions: number[];
    actionMap!: ActionMap;
    speed: number = 1000 / 1.5;

    constructor() {
        this.state = new State()
        this.dimensions = [10, 10];
        this.renderer = new Renderer();
        this.renderer.init();
        this.actionMap = {
            [KeyCode.Left]: () => this.state.move(DirectionX.Left),
            [KeyCode.Right]: () => this.state.move(DirectionX.Right),
            [KeyCode.Down]: () => this.state.fall(),
            [KeyCode.Up]: () => this.state.drop(),
            [KeyCode.Space]: () => this.elapsed(),
            [KeyCode.X]: () => this.state.rotate(Rotation.Cw),
            [KeyCode.Y]: () => this.state.rotate(Rotation.Ccw),
        }
    }

    run() {
        this.init();
        this.loop();
    }

    init() {
        window.addEventListener("keydown", event => {
            const action = this.actionMap[event.keyCode];
            if (action) {
                action();
            }
        });
        setInterval(() => {
            this.elapsed();
        }, this.speed);
    }

    loop() {
        this.update();
        this.render();
        window.requestAnimationFrame(this.loop.bind(this));
    }

    elapsed() {
        this.state.check();
        this.state.fall();
    }

    update() {
    }

    render() {
        this.renderer.clear();
        this.state.render(this.renderer);
        this.renderer.debug(this);
    }
}
