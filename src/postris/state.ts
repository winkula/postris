import { Board } from "./board";
import { tetriminos, Piece, Tetrimino } from "./piece";
import { Renderer } from "./renderer";
import { choice, range } from "./helpers";

export class State {
    board: Board;
    current!: Piece;
    next?: Tetrimino;
    lines: number = 0;

    constructor() {
        this.board = new Board(10, 20);
        this.spawn();
    }

    get fallHeight() {
        return Math.min(
            ...this.current.blocks.map(block => this.board.fallSpace(block))
        );
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

    private apply(transformed: Piece, check: boolean = false) {
        if (!this.board.isCollision(transformed)) {
            this.current = transformed;
            if (check) {
                this.check();
            }
        }
    }

    move(direction: number) {
        this.apply(
            this.current.move(direction)
        );
    }

    rotate(direction: number) {
        this.apply(
            this.current.rotate(direction)
        );
    }

    fall() {
        this.apply(
            this.current.fall()
        );
    }

    drop() {
        this.apply(
            this.current.fall(this.fallHeight)
        , true);       
    }

    check() {
        if (this.isLanded) {
            this.board.place(this.current);
            this.lines += this.board.clearLines();
            this.spawn();
        }
        if (this.isGameOver) {
            throw new Error("Game over");
        }
    }

    render(r: Renderer) {
        this.board?.render(r);
        this.current?.render(r);
    }
}
