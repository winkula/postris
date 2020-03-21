import { Renderer } from "./renderer";
import { Piece, Tetrimino } from "./piece";
import { Vec, range } from "./helpers";

export class Board {
    readonly width: number;
    readonly height: number;
    readonly cells: Array<Array<string | undefined>>;
    current?: Piece;
    next?: Piece;
    origin: Vec;

    constructor(width: number = 10, height: number = 10) {
        this.width = 10;
        this.height = 20;
        this.cells = range(width).map(() => range(height).map(() => undefined));
        this.origin = new Vec(5, 15);
    }

    newPiece(tetrimino: Tetrimino) {
        const piece = new Piece(this, tetrimino);
        this.current = piece;
    }

    place() {
        if (this.current) {
            this.current.tetrimino.shape.forEach(v =>
                this.cells[v.x][v.y] = this.current?.tetrimino.color
            );
            this.current = undefined;
        }
    }

    fall() {
        if (this.current) {
            this.current.fall();
        }
    }

    isFree(vec: Vec) {
        return this.cells[vec.x]?.[vec.y] === undefined;
    }

    render(r: Renderer) {
        const getColor = (value: string | undefined) => value ?? "white";
        for (const x of range(this.width)) {
            for (const y of range(this.height)) {
                r.renderBlock(x, y, getColor(this.cells[x][y]));
            }
        }
        this.current?.render(r);
    }
}
