import { Vec } from "../helpers";
import { Rotation, Direction } from "./state";

enum TetriminoType {
    O = 0,
    I = 1,
    S = 2,
    Z = 3,
    L = 4,
    J = 5,
    T = 6
}

export class Tetrimino {
    readonly type: TetriminoType;
    readonly color: string;
    readonly shape: Vec[][];
    readonly texture?: string;

    constructor(type: TetriminoType, color: string, shape: Vec[][], texture?: string) {
        this.type = type;
        this.color = color;
        this.shape = shape;
        this.texture = texture;
    }

    blocks(rotation: number = 0) {
        if (rotation < 0 || rotation > 3) throw new Error(`Invalid rotation: ${rotation}`);
        return this.shape[rotation];
    }
}

export class Piece {
    readonly tetrimino: Tetrimino;
    readonly position: Vec;
    readonly rotation: number;

    constructor(tetrimino: Tetrimino, position: Vec, rotation: number = 0) {
        this.tetrimino = tetrimino;
        this.position = position;
        this.rotation = rotation;
    }

    get blocks() {
        return this.tetrimino.blocks(this.rotation).map(v => v.add(this.position));
    }

    fall(distance: number = 1) {
        const newPosition = this.position.add(new Vec(0, -distance));
        return new Piece(this.tetrimino, newPosition, this.rotation);
    }

    move(direction: Direction) {
        const newPosition = this.position.add(new Vec(direction, 0));
        return new Piece(this.tetrimino, newPosition, this.rotation);
    }

    rotate(rotation: Rotation) {
        const fullRotation = 4;
        const newRotation = (this.rotation + rotation + fullRotation) % fullRotation;
        return new Piece(this.tetrimino, this.position, newRotation);
    }
}

export const tetriminos = [
    new Tetrimino(TetriminoType.O, "cyan", [
        [new Vec(0, -1), new Vec(0, 0), new Vec(1, -1), new Vec(1, 0)],
        [new Vec(0, -1), new Vec(0, 0), new Vec(1, -1), new Vec(1, 0)],
        [new Vec(0, -1), new Vec(0, 0), new Vec(1, -1), new Vec(1, 0)],
        [new Vec(0, -1), new Vec(0, 0), new Vec(1, -1), new Vec(1, 0)]
    ]),
    new Tetrimino(TetriminoType.I, "yellow", [
        [new Vec(-1, 0), new Vec(0, 0), new Vec(1, 0), new Vec(2, 0)],
        [new Vec(0, -1), new Vec(0, 0), new Vec(0, 1), new Vec(0, 2)],
        [new Vec(-1, 0), new Vec(0, 0), new Vec(1, 0), new Vec(2, 0)],
        [new Vec(0, -1), new Vec(0, 0), new Vec(0, 1), new Vec(0, 2)]
    ]),
    new Tetrimino(TetriminoType.T, "purple", [
        [new Vec(-1, 0), new Vec(0, -1), new Vec(0, 0), new Vec(1, 0)],
        [new Vec(-1, 0), new Vec(0, -1), new Vec(0, 0), new Vec(0, 1)],
        [new Vec(-1, 0), new Vec(0, 0), new Vec(0, 1), new Vec(1, 0)],
        [new Vec(0, -1), new Vec(0, 0), new Vec(0, 1), new Vec(1, 0)]
    ]),
    new Tetrimino(TetriminoType.S, "green", [
        [new Vec(-1, -1), new Vec(0, -1), new Vec(0, 0), new Vec(1, 0)],
        [new Vec(-1, 0), new Vec(-1, 1), new Vec(0, -1), new Vec(0, 0)],
        [new Vec(-1, -1), new Vec(0, -1), new Vec(0, 0), new Vec(1, 0)],
        [new Vec(-1, 0), new Vec(-1, 1), new Vec(0, -1), new Vec(0, 0)]
    ]),
    new Tetrimino(TetriminoType.Z, "red", [
        [new Vec(-1, 0), new Vec(0, -1), new Vec(0, 0), new Vec(1, -1)],
        [new Vec(-1, -1), new Vec(-1, 0), new Vec(0, 0), new Vec(0, 1)],
        [new Vec(-1, 0), new Vec(0, -1), new Vec(0, 0), new Vec(1, -1)],
        [new Vec(-1, -1), new Vec(-1, 0), new Vec(0, 0), new Vec(0, 1)]
    ]),
    new Tetrimino(TetriminoType.J, "blue", [
        [new Vec(-1, 0), new Vec(0, 0), new Vec(1, -1), new Vec(1, 0)],
        [new Vec(-1, -1), new Vec(0, -1), new Vec(0, 0), new Vec(0, 1)],
        [new Vec(-1, 0), new Vec(-1, 1), new Vec(0, 0), new Vec(1, 0)],
        [new Vec(0, -1), new Vec(0, 0), new Vec(0, 1), new Vec(1, 1)]
    ]),
    new Tetrimino(TetriminoType.L, "orange", [
        [new Vec(-1, -1), new Vec(-1, 0), new Vec(0, 0), new Vec(1, 0)],
        [new Vec(-1, 1), new Vec(0, -1), new Vec(0, 0), new Vec(0, 1)],
        [new Vec(-1, 0), new Vec(0, 0), new Vec(1, 0), new Vec(1, 1)],
        [new Vec(0, -1), new Vec(0, 0), new Vec(0, 1), new Vec(1, -1)]
    ]),
];
