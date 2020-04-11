import { Game } from "./game";
import { containsAll } from "./helpers";

let started = false;
const keys: number[] = [];
const target = [73, 74, 76, 79, 83, 84, 90];

function play() {
    if (started) {
        return;
    }
    started = true;
    const startLevel = 1;
    const game = new Game(startLevel);
    game.start();
}

document.onkeypress = (event) => {
    if (started) {
        return;
    }
    keys.push(event.keyCode);
    if (keys.length > target.length) {
        keys.shift();
    }
    console.log(keys);
    if (containsAll(keys, target)) {
        play();
    }
}

document.onclick = () => {
    play();
}
