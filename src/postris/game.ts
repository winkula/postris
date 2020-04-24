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
    X = 88,
    C = 67,
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
    running = false;
    executing = false;
    gfx: Gfx;
    sfx: Sfx;

    constructor(startLevel: number = 1) {
        this.state = new State(startLevel);
        this.speed = calculateSpeed(startLevel);
        this.gfx = new Gfx(this.state.matrix.dimensions);
        this.sfx = new Sfx(startLevel);
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
            [KeyCode.C]: <ActionDefinition>{
                action: () => this.state.hold()
            }
        }
    }

    async load() {
        await this.gfx.init();
        this.renderState();
        this.render();
        window.addEventListener("keydown", async (event: KeyboardEvent) => {
            if (!this.running && !this.state.isGameOver) {
                await this.start();
            }
            const action = this.actions[event.keyCode];
            if (action) {
                await this.execute(action);
            }
        });
    }

    async start() {
        this.running = true;
        this.sfx.startMusic();
        this.loop();
    }

    private async execute(action: ActionDefinition) {
        if (!this.running || this.executing || this.state.isGameOver) {
            return;
        }

        this.executing = true;

        const result = action.action();

        if (this.state.isGameOver) {
            this.running = false;
            this.sfx.stopMusic();
            this.sfx.gameOver();
            this.renderState(true);
            await this.gfx.animateGameOver(this.state.matrix);
        }
        else if (result.success) {
            action.sfx?.(result);
            this.gfx.renderPiece(result.after, undefined);
            this.gfx.renderPreview(this.state.preview);
            await action.gfx?.(result);
            if (result.locked) {
                if (result.lines?.length > 0) {
                    this.sfx.scored(result.lines?.length, this.state.level);
                    await this.gfx.animateClear(result.lines);
                    this.speed = calculateSpeed(this.state.level);
                }
            }
            this.renderState();
        }

        this.executing = false;
    }

    private renderState(noShadow = false) {
        this.gfx.renderPiece(this.state.piece, noShadow ? undefined : this.state.shadow);
        this.gfx.renderMatrix(this.state.matrix);
        this.gfx.renderPreview(this.state.preview);
        this.gfx.renderHold(this.state.holded);
        this.gfx.renderText(this.state);
    }

    private async loop() {
        while (this.running) {
            await this.execute(<ActionDefinition>{
                action: () => this.state.elapsed()
            });
            await wait(this.speed);
        }
    }

    private render() {
        let start: number | undefined;
        let last: number | undefined;

        const callback = (timestamp: number) => {
            if (!start) {
                start = timestamp;
            }
            const delta = timestamp - (last ?? timestamp);
            this.state.time = Math.floor((timestamp - start) / 1000);
            this.gfx.render(delta);
            last = timestamp;
            window.requestAnimationFrame(callback);
        };

        window.requestAnimationFrame(callback);
    }
}
