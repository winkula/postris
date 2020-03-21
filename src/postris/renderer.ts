export class Renderer {
    ctx: CanvasRenderingContext2D | null = null;

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
        this.ctx = canvas.getContext("2d");
    }
}
