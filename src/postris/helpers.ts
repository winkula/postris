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

export const wait = (time: number) => new Promise<void>(res => setTimeout(res, time));

function printCells(cells: any) {
    const getChar = (char: string) => {
        if (char === undefined) return " ";
        if (char === "") return ".";
        return "#"; 
    }
    return cells.map((r: any) => r?.map(getChar).join(""));
}

export const inspect = (object: any) => {
    // Note: cache should not be re-used by repeated calls to JSON.stringify.
    let cache: any[] = [];
    return JSON.stringify(object, function (key, value) {

        if (key === "cells") return printCells(value);

        if (key === "shape") return undefined;
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
