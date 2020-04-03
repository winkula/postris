import { Gfx } from "./ui/gfx";
import { State, Direction, Rotation, ActionResult } from "./logic/state";
import { Sfx } from "./ui/sfx";
import { wait } from "./helpers";

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
    dimensions: number[];
    actionMap!: ActionMap;
    speed: number = 1000 / 1.5;
    timerHandle?: NodeJS.Timeout;
    running = true;

    gfx: Gfx;
    sfx: Sfx;

    constructor() {
        this.state = new State();
        this.dimensions = [10, 10];
        this.gfx = new Gfx(this.state);
        this.actionMap = {
            [KeyCode.Left]: () => this.do(
                () => this.state.move(Direction.Left),
                () => this.sfx.move()
            ),
            [KeyCode.Right]: () => this.do(
                () => this.state.move(Direction.Right),
                () => this.sfx.move()
            ),
            [KeyCode.Down]: () => this.do(
                () => this.state.fall(),
                () => this.sfx.fall()
            ),
            [KeyCode.Up]: () => this.do(
                () => this.drop(),
                () => this.sfx.drop()
            ),
            [KeyCode.X]: () => this.do(
                () => this.state.rotate(Rotation.Clockwise),
                () => this.sfx.rotate()
            ),
            [KeyCode.Y]: () => this.do(
                () => this.state.rotate(Rotation.CounterClockwise),
                () => this.sfx.rotate()
            ),
        }
        this.sfx = new Sfx();
    }

    async run() {
        this.gfx.init();
        await this.init();
    }

    async init() {
        await this.gfx.init();
        window.onkeydown = (event: KeyboardEvent) => {
            const action = this.actionMap[event.keyCode];
            action?.();
        };
        this.sfx.play();
        this.render();
        this.loop();
    }

    do(action: () => ActionResult, sound?: () => void) {
        if (!this.running) {
            return;
        }
        try {
            const result = action?.();
            if (result.success) {
                sound?.();
                this.gfx.changed(this.state);
            }
            if (result.lines) {
                this.gfx.lines(result.lines);
            }
            if (result.spawned) {
            }
            if (result.gameOver) {
                this.running = false;
                console.log("Game is over");
            }
        } catch (error) {
            this.running = false;
            if (this.timerHandle) {
                clearTimeout(this.timerHandle);
            }
        }
    }

    async loop() {
        while (this.running) {
            this.elapsed();
            await wait(this.speed);
        }
    }

    drop() {
        const result = this.state.drop();
        if (result.success) {
            this.gfx.changed(this.state);
            this.gfx.drop();
            this.sfx.drop();
        }
        return result;
    }

    elapsed() {
        this.state.check();
        const result = this.state.fall();
        if (result.success) {
            this.gfx.changed(this.state);
            this.sfx.fall();
        }
        return result;
    }

    render() {
        let last = 0;
        const callback = (time: number) => {
            const delta = time - last;
            last = time;
            this.gfx.render(delta);
            window.requestAnimationFrame(callback);
        };
        callback(0);
    }
}
