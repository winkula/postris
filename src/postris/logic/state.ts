import { Board } from "./board";
import { tetriminos, Piece, Tetrimino } from "./piece";
import { Gfx } from "../ui/gfx";
import { choice, range } from "../helpers";

export enum Direction {
    Left = -1,
    Right = 1
}

export enum Rotation {
    CounterClockwise = -1,
    Clockwise = 1
}

export class ActionResult {
    success: boolean = false;
    spawned: boolean = false;
    gameOver: boolean = false;
    lines: number = 0;
    previous?: Piece;
}

export class State {
    board: Board;
    current!: Piece;
    next?: Tetrimino;
    level: number = 1;
    lines: number = 0;
    score: number = 0;
    time: number = 55;

    constructor() {
        this.board = new Board(10, 20);
        this.spawn();
    }

    get fallHeight() {
        return Math.min(
            ...this.current.blocks.map(block => this.board.fallSpace(block))
        );
    }

    get shadow() {
        return this.current.fall(this.fallHeight);
    }

    get isLanded() {
        return this.fallHeight <= 0;
    }

    get isGameOver() {
        return this.fallHeight < 0;
    }

    private spawn() {
        const next = choice(tetriminos);
        const newCurrent = new Piece(this.next ?? choice(tetriminos), this.board.origin);
        this.next = next;
        this.current = newCurrent;
    }

    private apply(transformed: Piece) {
        if (this.isGameOver) {
            throw new Error(`Game over: you can not continue playing :(`);
        }
        if (!this.board.isCollision(transformed)) {
            const previous = this.current;
            this.current = transformed;
            return <ActionResult>{ success: true, previous };
        }
        return <ActionResult>{};
    }

    move(direction: Direction) {
        return this.apply(
            this.current.move(direction)
        );
    }

    rotate(rotation: Rotation) {
        return this.apply(
            this.current.rotate(rotation)
        );
    }

    fall() {
        return this.apply(
            this.current.fall()
        );
    }

    drop() {
        this.apply(
            this.current.fall(this.fallHeight),
        );
        return this.check();
    }

    check() {
        if (this.isLanded) {
            this.board.place(this.current);
            const lines = this.board.clearLines();
            this.lines += lines;
            this.spawn();
            return <ActionResult>{
                success: true,
                spawned: true,
                gameOver: this.isGameOver,
                lines: lines,
            };
        }
        return <ActionResult>{};
    }

    render(gfx: Gfx) {
        this.board?.render(gfx);
        this.current?.render(gfx);
    }
}
