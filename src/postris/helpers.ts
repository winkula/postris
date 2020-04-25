export class Vec {
    readonly x: number;
    readonly y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    get angle() {
        return Math.atan2(this.y, this.x);
    }

    get magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    add = (vec: Vec) => new Vec(this.x + vec.x, this.y + vec.y);
    sub = (vec: Vec) => new Vec(this.x - vec.x, this.y - vec.y);
}

export const choice = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

export const wait = (time: number) => new Promise<void>(res => setTimeout(res, time));

export const range = (n: number) => [...Array<number>(n).keys()];

export function* cartesian(width: number, height: number) {
    for (const x of range(width)) {
        for (const y of range(height)) {
            yield new Vec(x, y);
        }
    }
}
