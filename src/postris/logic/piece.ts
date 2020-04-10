import { Vec } from "../helpers";
import { Rotation, Direction } from "./state";

export enum TetriminoType {
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
    readonly shape: Vec[][];

    constructor(type: TetriminoType, shape: Vec[][]) {
        this.type = type;
        this.shape = shape;
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
    new Tetrimino(TetriminoType.O, [
        [new Vec(0, -1), new Vec(0, 0), new Vec(1, -1), new Vec(1, 0)],
        [new Vec(0, -1), new Vec(0, 0), new Vec(1, -1), new Vec(1, 0)],
        [new Vec(0, -1), new Vec(0, 0), new Vec(1, -1), new Vec(1, 0)],
        [new Vec(0, -1), new Vec(0, 0), new Vec(1, -1), new Vec(1, 0)]
    ]),
    new Tetrimino(TetriminoType.I, [
        [new Vec(-1, 0), new Vec(0, 0), new Vec(1, 0), new Vec(2, 0)],
        [new Vec(0, -1), new Vec(0, 0), new Vec(0, 1), new Vec(0, 2)],
        [new Vec(-1, 0), new Vec(0, 0), new Vec(1, 0), new Vec(2, 0)],
        [new Vec(0, -1), new Vec(0, 0), new Vec(0, 1), new Vec(0, 2)]
    ]),
    new Tetrimino(TetriminoType.T, [
        [new Vec(-1, 0), new Vec(0, -1), new Vec(0, 0), new Vec(1, 0)],
        [new Vec(-1, 0), new Vec(0, -1), new Vec(0, 0), new Vec(0, 1)],
        [new Vec(-1, 0), new Vec(0, 0), new Vec(0, 1), new Vec(1, 0)],
        [new Vec(0, -1), new Vec(0, 0), new Vec(0, 1), new Vec(1, 0)]
    ]),
    new Tetrimino(TetriminoType.S, [
        [new Vec(-1, -1), new Vec(0, -1), new Vec(0, 0), new Vec(1, 0)],
        [new Vec(-1, 0), new Vec(-1, 1), new Vec(0, -1), new Vec(0, 0)],
        [new Vec(-1, -1), new Vec(0, -1), new Vec(0, 0), new Vec(1, 0)],
        [new Vec(-1, 0), new Vec(-1, 1), new Vec(0, -1), new Vec(0, 0)]
    ]),
    new Tetrimino(TetriminoType.Z, [
        [new Vec(-1, 0), new Vec(0, -1), new Vec(0, 0), new Vec(1, -1)],
        [new Vec(-1, -1), new Vec(-1, 0), new Vec(0, 0), new Vec(0, 1)],
        [new Vec(-1, 0), new Vec(0, -1), new Vec(0, 0), new Vec(1, -1)],
        [new Vec(-1, -1), new Vec(-1, 0), new Vec(0, 0), new Vec(0, 1)]
    ]),
    new Tetrimino(TetriminoType.J, [
        [new Vec(-1, 0), new Vec(0, 0), new Vec(1, -1), new Vec(1, 0)],
        [new Vec(-1, -1), new Vec(0, -1), new Vec(0, 0), new Vec(0, 1)],
        [new Vec(-1, 0), new Vec(-1, 1), new Vec(0, 0), new Vec(1, 0)],
        [new Vec(0, -1), new Vec(0, 0), new Vec(0, 1), new Vec(1, 1)]
    ]),
    new Tetrimino(TetriminoType.L, [
        [new Vec(-1, -1), new Vec(-1, 0), new Vec(0, 0), new Vec(1, 0)],
        [new Vec(-1, 1), new Vec(0, -1), new Vec(0, 0), new Vec(0, 1)],
        [new Vec(-1, 0), new Vec(0, 0), new Vec(1, 0), new Vec(1, 1)],
        [new Vec(0, -1), new Vec(0, 0), new Vec(0, 1), new Vec(1, -1)]
    ]),
];
