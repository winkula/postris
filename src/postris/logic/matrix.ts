import { Piece } from "./piece";
import { Vec, range } from "../helpers";

const freeCell = "";

export class Block {
    position!: Vec;
    color!: string;
}

export class Matrix {
    readonly width: number;
    readonly height: number;
    readonly origin: Vec;
    private cells: (string | undefined)[][];

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.origin = new Vec(Math.round(width / 2 - 1), height);
        this.cells = range(height).map(() => range(width).map(() => freeCell));
    }

    get dimensions() {
        return new Vec(this.width, this.height);
    }

    get blocks() {
        const blocks: Block[] = [];
        for (const x of range(this.width)) {
            for (const y of range(this.height)) {
                const vec = new Vec(x, y);
                const cellValue = this.get(vec);
                if (cellValue !== freeCell) {
                    blocks.push(<Block>{
                        position: vec,
                        color: cellValue
                    });
                }
            }
        }
        return blocks;
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

    isAbove(block: Vec) {
        return block.y >= this.height;
    }

    isCollision(piece: Piece) {
        return piece.blocks.find(block =>
            !this.isAbove(block) && !this.isFree(block)
        ) !== undefined;
    }

    fallSpace(block: Vec) {
        for (let distance = 0; distance <= block.y; distance++) {
            const newPosition = block.add(new Vec(0, -distance));
            if (this.isAbove(newPosition)) {
                continue;
            }
            if (!this.isFree(newPosition)) {
                return distance - 1;
            }
        }
        return block.y;
    }

    place(piece: Piece) {
        piece.blocks.forEach(v =>
            this.set(v, piece.tetrimino.color)
        );
    }

    clearLines() {
        const isFull = (row: Array<string | undefined>) => row.filter(cell => cell === freeCell).length === 0;
        const fullLines = range(this.height).filter(i => isFull(this.cells[i]));
        this.cells = this.cells.filter(row => !isFull(row));
        const cleared = this.height - this.cells.length;
        range(cleared).forEach(i => this.cells.push(range(this.width).map(() => freeCell)));
        return fullLines;
    }
}
