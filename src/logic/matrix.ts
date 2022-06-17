import { Piece, TetriminoType } from "./piece";
import { Vec, range, cartesian } from "../helpers";

const freeCell = undefined;
const buildLine = (width: number) => range(width).map(() => freeCell);

export class Block {
  position!: Vec;
  type?: TetriminoType;
}

export class Matrix {
  private readonly width: number;
  private readonly height: number;
  private cells: (TetriminoType | undefined)[][];
  readonly origin: Vec;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.cells = range(height).map((_) => buildLine(width));
    this.origin = new Vec(Math.round(width / 2 - 1), height - 1);
  }

  get dimensions() {
    return new Vec(this.width, this.height);
  }

  get blocks() {
    return [...cartesian(this.width, this.height)]
      .map(
        (vec) =>
          <Block>{
            position: vec,
            type: this.get(vec),
          }
      )
      .filter((block) => block.type !== freeCell);
  }

  get(block: Vec) {
    return this.cells[block.y]?.[block.x];
  }

  set(block: Vec, type: TetriminoType) {
    if (this.isContained(block)) {
      this.cells[block.y][block.x] = type;
    }
  }

  isFree(block: Vec) {
    return this.get(block) === freeCell;
  }

  isContained(block: Vec, checkTop: boolean = true) {
    return (
      block.x >= 0 &&
      block.x < this.width &&
      block.y >= 0 &&
      (block.y < this.height || !checkTop)
    );
  }

  isAbove(block: Vec) {
    return block.y >= this.height;
  }

  isCollision(piece: Piece) {
    return (
      piece.blocks.find(
        (block) => !this.isContained(block, false) || !this.isFree(block)
      ) !== undefined
    );
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
    piece.blocks.forEach((v) => this.set(v, piece.tetrimino.type));
  }

  clearLines() {
    const isRowFull = (row: Array<TetriminoType | undefined>) =>
      row.filter((cell) => cell === freeCell).length === 0;
    const clearedLineNumbers = range(this.height).filter((i) =>
      isRowFull(this.cells[i])
    );
    this.cells = this.cells.filter((row) => !isRowFull(row));
    range(this.height - this.cells.length).forEach((_) =>
      this.cells.push(buildLine(this.width))
    );
    return clearedLineNumbers;
  }
}
