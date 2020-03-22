import { Renderer } from "./renderer";
import { Vec } from "./helpers";

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
    private readonly shape: Vec[][];

    constructor(type: TetriminoType, color: string, shape: Vec[][]) {
        this.type = type;
        this.color = color;
        this.shape = shape;
    }

    blocks(rotation: number) {
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

    move(distance: number) {
        const newPosition = this.position.add(new Vec(distance, 0));
        return new Piece(this.tetrimino, newPosition, this.rotation);
    }

    rotate(direction: number) {
        const fullRotation = 4;
        const newRotation = (this.rotation + direction + fullRotation) % fullRotation;
        return new Piece(this.tetrimino, this.position, newRotation);
    }

    render(renderer: Renderer) {
        this.blocks.forEach(v =>
            renderer.renderBlock(v, this.tetrimino.color)
        )
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
