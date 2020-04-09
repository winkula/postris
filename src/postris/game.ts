import { Gfx } from "./ui/gfx";
import { State, Direction, Rotation, ActionResult } from "./logic/state";
import { Sfx } from "./ui/sfx";
import { wait } from "./helpers";
import { calculateSpeed } from "./logic/helpers";

enum KeyCode {
    Left = 37,
    Up = 38,
    Right = 39,
    Down = 40,
    Y = 89,
    X = 88
}

interface ActionMap {
    [key: number]: ActionDefinition | undefined;
}

interface ActionDefinition {
    action: () => ActionResult;
    gfx?: (result: ActionResult) => Promise<void>;
    sfx?: (result: ActionResult) => void;
}

export class Game {
    state: State;
    actions: ActionMap;
    speed: number;
    running = true;
    executing = false;
    gfx: Gfx;
    sfx: Sfx;

    constructor(startLevel: number = 1) {
        this.state = new State(startLevel);
        this.speed = calculateSpeed(startLevel);
        this.gfx = new Gfx(this.state.matrix.dimensions);
        this.sfx = new Sfx();
        this.actions = {
            [KeyCode.Left]: <ActionDefinition>{
                action: () => this.state.move(Direction.Left),
                sfx: () => this.sfx.move()
            },
            [KeyCode.Right]: <ActionDefinition>{
                action: () => this.state.move(Direction.Right),
                sfx: () => this.sfx.move()
            },
            [KeyCode.Down]: <ActionDefinition>{
                action: () => this.state.fall(),
                sfx: () => this.sfx.move()
            },
            [KeyCode.Up]: <ActionDefinition>{
                action: () => this.state.drop(),
                gfx: async (result) => await this.gfx.animateDrop(result.before!, result.after!),
                sfx: () => this.sfx.drop(),
            },
            [KeyCode.X]: <ActionDefinition>{
                action: () => this.state.rotate(Rotation.Clockwise),
                sfx: () => this.sfx.rotate()
            },
            [KeyCode.Y]: <ActionDefinition>{
                action: () => this.state.rotate(Rotation.CounterClockwise),
                sfx: () => this.sfx.rotate()
            },
        }
    }

    async start() {
        await this.gfx.init();
        window.onkeydown = async (event: KeyboardEvent) => {
            const action = this.actions[event.keyCode];
            if (action) {
                await this.execute(action);
            }
        }
        this.sfx.music();
        this.gfx.renderPreview(this.state.preview);
        this.render();
        this.loop();
    }

    private async execute(action: ActionDefinition) {
        if (!this.running || this.executing || this.state.isGameOver) {
            return;
        }
        this.executing = true;
        const result = action.action();
        if (result.gameOver) {
            this.running = false;
            this.sfx.gameOver();
        }
        else if (result.success) {
            action.sfx?.(result);

            this.gfx.renderPiece(result.after);
            this.gfx.renderShadow();
            await action.gfx?.(result);

            if (result.locked) {
                if (result.lines?.length > 0) {
                    this.sfx.scored();
                    await this.gfx.animateClear(result.lines);
                    this.speed = calculateSpeed(this.state.level);
                }
                this.gfx.renderMatrix(this.state.matrix);
                this.gfx.renderPreview(this.state.preview);
            }
            this.gfx.renderPiece(this.state.piece);
            this.gfx.renderShadow(this.state.shadow);
            this.gfx.renderText(this.state);
        }
        this.executing = false;
    }

    private async loop() {
        while (this.running) {
            await this.execute(<ActionDefinition>{
                action: () => this.state.elapsed(),
            });
            await wait(this.speed);
        }
    }

    private render() {
        let last = 0;
        const callback = (time: number) => {
            this.state.time = Math.floor(time / 1000);
            this.gfx.render(time - last);
            last = time;
            window.requestAnimationFrame(callback);
        };
        callback(0);
    }
}
