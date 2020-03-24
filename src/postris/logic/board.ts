import { Renderer } from "../gfx/renderer";
import { Piece, Tetrimino } from "./piece";
import { Vec, range } from "../helpers";

const freeCell = "";

export class Board {
    readonly width: number;
    readonly height: number;
    readonly origin: Vec;
    private cells: (string | undefined)[][];

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.origin = new Vec(Math.round(width / 2 - 1), height - 5);
        this.cells = range(height).map(() => range(width).map(() => freeCell));
    }

    get(block: Vec) {
        return this.cells[block.y]?.[block.x];
    }

    set(block: Vec, color: string) {
        if (this.isContained(block)) {
            this.cells[block.y][block.x] = color;
        }
    }

    isFree(block: Vec) {
        return this.get(block) === freeCell;
    }

    isContained(block: Vec) {
        return block.x >= 0 && block.x < this.width
            && block.y >= 0 && block.y < this.height;
    }

    isCollision(piece: Piece) {
        return piece.blocks.find(v =>
            !this.isFree(v)
        ) !== undefined;
    }

    fallSpace(block: Vec) {
        if (!this.isContained(block)) throw new Error(`Block is not contained in board: ${block}`);
        for (let h = 0; h < this.height; h++) {
            if (!this.isFree(new Vec(block.x, block.y - h))) {
                return h - 1;
            }
        }
        return 0;
    }

    place(piece: Piece) {
        piece.blocks.forEach(v =>
            this.set(v, piece.tetrimino.color)
        );
    }

    clearLines() {
        const isFull = (row: Array<string | undefined>) => row.filter(cell => cell === freeCell).length === 0;
        this.cells = this.cells.filter(row => !isFull(row));
        const cleared = this.height - this.cells.length;
        range(cleared).forEach(i => this.cells.push(range(this.width).map(() => freeCell)));
        return cleared;
    }

    render(r: Renderer) {
        const getColor = (value: string | undefined) => {
            if (!value || value == freeCell) return "black";
            return value;
        };
        for (const x of range(this.width)) {
            for (const y of range(this.height)) {
                const vec = new Vec(x, y);
                r.renderBlock(vec, getColor(this.get(vec)));
            }
        }
        r.renderWalls(this.width, this.height);
    }
}
