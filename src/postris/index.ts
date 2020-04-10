import { Game } from "./game";

let started = false;

document.onclick = () => {
    if (started){
        return;
    }
    started = true;
    const startLevel = 1;
    const game = new Game(startLevel);
    game.start();
}
