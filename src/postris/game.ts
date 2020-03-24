import { Renderer } from "./gfx/renderer";
import { State, Direction, Rotation } from "./logic/state";

enum KeyCode {
    Left = 37,
    Up = 38,
    Right = 39,
    Down = 40,
    Y = 89,
    X = 88
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
        this.renderer = new Renderer(this.state);
        this.renderer.init();
        this.actionMap = {
            [KeyCode.Left]: () => this.move(Direction.Left),
            [KeyCode.Right]: () => this.move(Direction.Right),
            [KeyCode.Down]: () => this.down(),
            [KeyCode.Up]: () => this.drop(),
            [KeyCode.X]: () => this.rotate(Rotation.Clockwise),
            [KeyCode.Y]: () => this.rotate(Rotation.CounterClockwise),
        }
    }

    async run() {
        await this.init();
    }

    async init() {
        const rendererPromise = this.renderer.init();
        window.addEventListener("keydown", event => {
            const action = this.actionMap[event.keyCode];
            action?.();
        });
        await rendererPromise;
        this.loop();
        this.renderer.spawn(this.state.current);
    }

    loop() {
        setInterval(() => this.elapsed(), this.speed);
    }

    move(direction: Direction) {
        this.state.move(direction);
        this.renderer.move(direction);
        this.render();
    }

    down() {
        this.state.fall();
        this.render();
    }

    drop() {
        this.state.drop();
        this.render();
    }

    rotate(rotation: Rotation) {
        this.state.rotate(rotation);
        this.renderer.rotate(rotation);
        this.render();
    }

    elapsed() {
        this.state.check();
        this.state.fall();
        this.render();
    }

    render() {
        this.renderer.clear();
        this.state.render(this.renderer);
        this.renderer.render();
        window.requestAnimationFrame(this.render.bind(this));
    }
}
