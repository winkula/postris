export class Vec {
    readonly x: number;
    readonly y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    add = (vec: Vec) => new Vec(this.x + vec.x, this.y + vec.y);
    static fromX = (x: number) => new Vec(x, 0);
    static fromY = (y: number) => new Vec(0, y);
}

export const range = (x: number) => [...Array<number>(x).keys()];

export const choice = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

export const inspect = (object: any) => {
    // Note: cache should not be re-used by repeated calls to JSON.stringify.
    let cache: any[] = [];
    return JSON.stringify(object, function (key, value) {
        if (key === "cells") return "";
        if (typeof value === 'object' && value !== null) {
            if (cache.indexOf(value) !== -1) {
                // Duplicate reference found, discard key
                return;
            }
            // Store value in our collection
            cache.push(value);
        }
        return value;
    }, 2);
}
