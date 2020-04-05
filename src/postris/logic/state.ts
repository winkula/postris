import { Matrix } from "./matrix";
import { tetriminos, Piece, Tetrimino } from "./piece";
import { choice } from "../helpers";
import { calculateScore, calculateLevel } from "./helpers";

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
    locked: boolean = false;
    gameOver: boolean = false;
    lines: number[] = [];
    before?: Piece;
    after?: Piece;
}

export class State {
    matrix: Matrix;
    piece!: Piece;
    preview!: Tetrimino;
    startLevel: number;
    level: number;
    lines: number = 0;
    score: number = 0;
    time: number = 0;

    constructor(startLevel: number) {
        if (startLevel <= 0) {
            throw new Error(`Invalid startLevel: ${startLevel}. Must be greated than 0.`);
        }
        this.startLevel = startLevel;
        this.level = startLevel;
        this.matrix = new Matrix(10, 20);
        this.spawn();
    }

    get fallHeight() {
        return Math.min(
            ...this.piece.blocks.map(block => this.matrix.fallSpace(block))
        );
    }

    get shadow() {
        return this.piece.fall(this.fallHeight);
    }

    get isLanded() {
        return this.fallHeight <= 0;
    }

    get isGameOver() {
        return this.fallHeight < 0;
    }

    private spawn() {
        const newPreview = choice(tetriminos);
        const newPiece = new Piece(this.preview ?? choice(tetriminos), this.matrix.origin);
        this.preview = newPreview;
        this.piece = newPiece;
    }

    private apply(transformed: Piece) {
        if (this.isGameOver) {
            throw new Error(`Game over: you can not continue playing :(`);
        }
        if (!this.matrix.isCollision(transformed)) {
            const before = this.piece;
            this.piece = transformed;
            return <ActionResult>{
                success: true,
                before: before,
                after: transformed
            };
        }
        return <ActionResult>{};
    }

    move(direction: Direction) {
        return this.apply(
            this.piece.move(direction)
        );
    }

    rotate(rotation: Rotation) {
        return this.apply(
            this.piece.rotate(rotation)
        );
    }

    fall() {
        return this.apply(
            this.piece.fall()
        );
    }

    drop() {
        return Object.assign({},
            this.apply(this.piece.fall(this.fallHeight)),
            this.check()
        );
    }

    elapsed() {
        return Object.assign({},
            this.check(),
            this.apply(this.piece.fall())
        );
    }

    check() {
        if (this.isLanded) {
            this.matrix.place(this.piece);
            const lines = this.matrix.clearLines();
            this.lines += lines.length;
            this.score += calculateScore(this.level, lines.length);
            this.level = calculateLevel(this.startLevel, this.lines);
            this.spawn();
            return <ActionResult>{
                success: true,
                spawned: true,
                locked: true,
                gameOver: this.isGameOver,
                lineCount: lines.length,
                lines: lines
            };
        }
        return <ActionResult>{};
    }
}
