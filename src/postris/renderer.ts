import { Game } from "./game";
import { inspect, Vec } from "./helpers";
import * as THREE from "three";

const geometry = new THREE.BoxGeometry(1, 1, 1);
geometry.translate(0.5, 0.5, 0.5);

// Create an image
const image = new Image(); // or document.createElement('img' );
// Create texture
var texture = new THREE.Texture(image);
// On image load, update texture
image.onload = () => { texture.needsUpdate = true };
// Set image source
image.src = 'data:image/png;base64,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';
const loader = new THREE.TextureLoader();
const m = loader.load('https://threejsfundamentals.org/threejs/resources/images/wall.jpg')

function createMaterial(color: string) {
    if (color == 'gray') return new THREE.MeshStandardMaterial({ color: color });
    return new THREE.MeshStandardMaterial({ map: texture });
}

function createCube(x: number, y: number, z: number, w: number, h: number, d: number, color: string) {
    const material = createMaterial(color);
    //const material = new THREE.MeshToonMaterial({ color: 0xffcc00 });
    //const material = new THREE.MeshPhongMaterial({ color: 0xffcc00 });
    const cube = new THREE.Mesh(geometry, material);
    cube.scale.set(w, h, d);
    cube.position.set(x, y, z);
    return cube;
}

export class Renderer {
    private scene: THREE.Scene;
    readonly camera: THREE.PerspectiveCamera;
    readonly renderer: THREE.WebGLRenderer;

    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(10 / 2, 17 / 2, 15);
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setClearColor('black', 0.8);

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        window.addEventListener("resize", () => {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        });

        const canvas = this.renderer.domElement;
        document.body.appendChild(canvas);
        this.setCanvasStyles(canvas);
    }

    /*
    private tranform(vec: Vec) {
        return new Vec((vec.x - 10 / 2) * this.blockSize, (vec.y - 15 / 2) * this.blockSize);
    }*/

    init() {
        this.createCanvas();
    }

    createCanvas() {
        /*
        const canvas = document.createElement("canvas");

        document.body.appendChild(canvas);
        const ctx = canvas.getContext("2d");
        if (ctx == null) {
            throw new Error("No 2d context found.");
        }
        this.ctx = ctx;
        this.canvas = canvas;
        */
    }

    setCanvasStyles(canvas: HTMLCanvasElement) {
        canvas.style.position = "absolute";
        canvas.style.top = "0";
        canvas.style.left = "0";
        canvas.style.zIndex = "100";
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    render() {
        //requestAnimationFrame(() => {
        this.renderer.render(this.scene, this.camera);
        //});
    }

    renderBlock(vec: Vec, color: string): void {
        if (color !== "black") {
            const block = createCube(vec.x, vec.y, 1, 1, 1, 1, color);
            this.scene.add(block);
        }
    }

    renderWalls(width: number, height: number) {
        const depth = 3;
        const wallWidth = 100;

        const left = createCube(-wallWidth, 0, 0, wallWidth, height, depth, "gray");
        this.scene.add(left);

        const right = createCube(width, 0, 0, wallWidth, height, depth, "gray");
        this.scene.add(right);

        const bottom = createCube(-wallWidth, -wallWidth, 0, wallWidth * 2 + width, wallWidth, depth, "gray");
        this.scene.add(bottom);
    }

    clear() {
        this.scene = new THREE.Scene();

        var light = new THREE.AmbientLight(0xffffff, 0.3); // soft white light
        this.scene.add(light);

        var directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight.position.set(10 / 2, 18 / 2, 20);
        this.scene.add(directionalLight);

        var pointlight = new THREE.PointLight(0xffffff, 0.3, 1000);
        pointlight.position.set(10 / 2, 18 / 2, 5);
        //pointlight.position.set(10 / 2, 30, 0);
        this.scene.add(pointlight);
    }

    debug(game: Game) {
        /*
        const text: string[] = [];
        const add = (line: string) => text.push(...line.split("\n"));

        add(`State: ${inspect(game.state)}`);

        let i = 0;
        this.ctx.fillStyle = "black";
        this.ctx.font = "11px Consolas"
        text.forEach(line =>
            this.ctx.fillText(line, 400, 30 + 10 * i++)
        );*/
    }
}
