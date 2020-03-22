import { Game } from "./game";
import { inspect, Vec } from "./helpers";

export class Renderer {
    canvas!: HTMLCanvasElement;
    ctx!: CanvasRenderingContext2D;

    init() {
        this.createCanvas();
    }

    createCanvas() {
        const canvas = document.createElement("canvas");
        canvas.style.position = "absolute";
        canvas.style.top = "0";
        canvas.style.left = "0";
        canvas.style.zIndex = "100";
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        document.body.appendChild(canvas);
        const ctx = canvas.getContext("2d");
        if (ctx == null) {
            throw new Error("No 2d context found.");
        }
        this.ctx = ctx;
        this.canvas = canvas;
    }

    renderBlock(vec: Vec, color: string): void {
        const blockSize = 30;
        this.ctx.fillStyle = color;
        this.ctx.fillRect(vec.x * blockSize, 500 + (-vec.y) * blockSize, blockSize, blockSize);
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    debug(game: Game) {
        const text: string[] = [];
        const add = (line: string) => text.push(...line.split("\n"));

        add(`State: ${inspect(game.state)}`);

        let i = 0;
        this.ctx.fillStyle = "black";        
        this.ctx.font = "11px Consolas"
        text.forEach(line =>
            this.ctx.fillText(line, 400, 30 + 10 * i++)
        );
    }
}
