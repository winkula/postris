export class Vec {
    readonly x: number;
    readonly y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    add = (vec: Vec) => new Vec(this.x + vec.x, this.y + vec.y);
    toString = () => `x=${this.x}, y=${this.y}`;
}

export const range = (x: number) => [...Array<number>(x).keys()];

export const choice = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

export const shuffle = (arr: any[]) => arr.sort(() => Math.random() - 0.5);

export const wait = (time: number) => new Promise<void>(res => setTimeout(res, time));

export const containsAll = (source: any[], target: any[]) => target.filter(x => source.includes(x)).length === target.length;
