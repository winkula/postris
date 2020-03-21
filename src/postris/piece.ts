import { Renderer } from "./renderer";
import { Board } from "./board";
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
    readonly shape: Vec[];

    constructor(type: TetriminoType, color: string, shape: Vec[]) {
        this.type = type;
        this.color = color;
        this.shape = shape;
    }
}

export class Piece {
    board: Board;
    tetrimino: Tetrimino;
    position: Vec;
    rotation: number = 0;

    constructor(board: Board, tetrimino: Tetrimino) {
        this.board = board;
        this.tetrimino = tetrimino;
        this.position = board.origin;
    }

    fall() {
        this.position = this.position.add(Vec.fromY(-1));
    }

    move(direction: number) {
        this.position = this.position.add(Vec.fromX(direction));
    }

    rotate(direction: number) {
        this.rotation = (this.rotation + direction) % 4;
    }

    isLanded() {
        return this.tetrimino.shape.find(v =>
            this.board.isFree(this.position.add(v))
        ) !== undefined;
    }

    render(renderer: Renderer) {
        this.tetrimino.shape.forEach(v =>
            renderer.renderBlock(this.position.x + v.x, this.position.y + v.y, this.tetrimino.color)
        )
    }
}

const shape = [
    new Vec(0, 0),
    new Vec(1, 0),
    new Vec(0, 1),
    new Vec(1, 1),
];

export const tetriminos = [
    new Tetrimino(TetriminoType.O, "cyan", shape),
    new Tetrimino(TetriminoType.I, "yellow", shape),
    new Tetrimino(TetriminoType.T, "purple", shape),
    new Tetrimino(TetriminoType.S, "green", shape),
    new Tetrimino(TetriminoType.Z, "red", shape),
    new Tetrimino(TetriminoType.J, "blue", shape),
    new Tetrimino(TetriminoType.L, "orange", shape),
];
