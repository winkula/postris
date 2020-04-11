import { Game } from "./game";

const containsAll = (source: any[], target: any[]) => target.filter(x => source.includes(x)).length === target.length;
const toKeyCodes = (str: string) => str.split("").map(x => x.charCodeAt(0));

let started = false;
let keys: number[] = [];
const target = toKeyCodes("ijlostz");

function play() {
    if (started) {
        return;
    }
    started = true;
    new Game().start();
}

document.addEventListener("keypress", (event) => {
    try {
        if (!started && event.keyCode === 13 && containsAll(keys, target)) {
            started = true;
            new Game().start();
        }
        keys = [event.keyCode].concat(keys.slice(0, 6));
    } catch (error) {
        console.log(error);
    }
});

document.addEventListener("click", play);
