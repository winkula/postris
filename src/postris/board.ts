//const range = x => Array.keys(2).

export class Board {
    width: number;
    height: number;
    cells: number[][];

    constructor(width: number = 10, height: number = 10) {
        this.width = 10;
        this.height = 10;
        this.cells = [];
    }
}
