import { Vec, wait, range, choice } from "../helpers";
import * as THREE from "three";
import { Piece, Tetrimino, TetriminoType } from "../logic/piece";
import { State } from "../logic/state";
import { createWalls, createFont, createTopLight, createFrontLight, createBlock, getTexture, createTweenAnimation, createTrail } from "./gfx-helpers";
import { Matrix } from "../logic/matrix";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export class Gfx {
    private scene: THREE.Scene;
    private infos: THREE.Object3D;
    private walls: THREE.Object3D;
    private matrix: THREE.Object3D;
    private gameOver: THREE.Object3D;
    private piece: THREE.Object3D;
    private shadow: THREE.Object3D;
    private preview: THREE.Object3D;
    private hold: THREE.Object3D;

    private mixer: THREE.AnimationMixer;

    private readonly camera: THREE.PerspectiveCamera;
    private readonly renderer: THREE.WebGLRenderer;

    private readonly ambientLight: THREE.AmbientLight;
    private readonly directionalLightTop: THREE.DirectionalLight;
    private readonly directionalLightFront: THREE.DirectionalLight;

    private textures: THREE.Texture[] = [];

    private dimensions: Vec;

    constructor(dimensions: Vec) {
        this.dimensions = dimensions;

        const pieceHudPos = new Vec(3, 10);
        const pieceHudZ = 1;

        this.scene = new THREE.Scene();
        this.infos = new THREE.Group();
        this.walls = this.moveToCenter(createWalls(dimensions));
        this.matrix = this.moveToCenter(new THREE.Group());
        this.gameOver = this.moveToCenter(new THREE.Group());
        this.piece = this.moveToCenter(new THREE.Group());
        this.shadow = this.moveToCenter(new THREE.Group());
        this.preview = this.moveToCenter(new THREE.Group());
        this.preview.position.add(new THREE.Vector3(this.dimensions.x + pieceHudPos.x, pieceHudPos.y, pieceHudZ));
        this.hold = this.moveToCenter(new THREE.Group());
        this.hold.position.add(new THREE.Vector3(-2 - pieceHudPos.x, pieceHudPos.y, pieceHudZ));

        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.directionalLightTop = createTopLight(dimensions);
        this.directionalLightFront = createFrontLight(dimensions);

        this.scene
            .add(this.infos)
            .add(this.walls)
            .add(this.matrix)
            .add(this.gameOver)
            .add(this.piece)
            .add(this.shadow)
            .add(this.preview)
            .add(this.hold)
            .add(this.ambientLight)
            .add(this.directionalLightTop)
            .add(this.directionalLightFront);

        this.camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 50);

        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setClearColor(0xFFFFFF, 0.8);
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        window.onresize = () => {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        };

        this.updateDom();
        this.mixer = new THREE.AnimationMixer(this.camera);
        
        if (false) {
            const controls = new OrbitControls(this.camera, this.renderer.domElement);
            controls.enableDamping = true;
            controls.enableKeys = false;
            controls.dampingFactor = 0.25;

            this.scene.add(new THREE.CameraHelper(this.directionalLightTop.shadow.camera));
            this.scene.add(new THREE.DirectionalLightHelper(this.directionalLightTop, 5, "blue"));
            this.scene.add(new THREE.DirectionalLightHelper(this.directionalLightFront, 5, "red"));
        }
    }

    async init() {
        // O = 0, I = 1, S = 2, Z = 3, L = 4, J = 5, T = 6
        const urls = [
            "public/textures/dispobox.png",
            "public/textures/fragile.png",
            "public/textures/box.png",
            "public/textures/zalando.png",
            "public/textures/letters.png",
            "public/textures/box2.png",
            "public/textures/eco.png",
        ];
        this.textures = await Promise.all(urls.map(url => getTexture(url)));
        this.animateCamera();
    }

    private updateDom() {
        const canvas = this.renderer.domElement;
        canvas.style.position = "absolute";
        canvas.style.top = "0";
        canvas.style.left = "0";
        canvas.style.zIndex = "1000";
        document.body.style.overflow = "hidden";
        document.body.appendChild(canvas);
    }

    private moveToCenter(object: THREE.Object3D) {
        object.position.x -= this.dimensions.x / 2;
        object.position.z -= 1;
        return object;
    }

    render(delta: number) {
        this.mixer?.update(delta / 1000);
        this.renderer.render(this.scene, this.camera);
    }

    renderMatrix(matrix: Matrix) {
        this.matrix.children = [];
        matrix.blocks.forEach(block =>
            this.matrix.add(createBlock(block.position, this.textures[block.type!]))
        );
    }

    renderPiece(piece?: Piece, shadow?: Piece) {
        this.renderPieceOnly(piece);
        this.renderShadowOnly(shadow);
    }

    private renderPieceOnly(piece?: Piece) {
        this.piece.children = [];
        if (!piece) return;
        const texture = this.textures[piece.tetrimino.type];
        piece.blocks.forEach(block =>
            this.piece.add(createBlock(block, texture))
        )
    }

    private renderShadowOnly(piece?: Piece) {
        this.shadow.children = [];
        if (!piece) return;
        const texture = this.textures[piece.tetrimino.type];
        piece.blocks.forEach(block =>
            this.shadow.add(createBlock(block, texture, 0.3))
        );
    }

    renderPreview(preview: Tetrimino) {
        this.preview.children = [];
        const texture = this.textures[preview.type];
        preview.blocks().forEach(block =>
            this.preview.add(createBlock(block, texture))
        );
    }

    renderHold(tetrimino?: Tetrimino) {
        this.hold.children = [];
        if (!tetrimino) return;
        const texture = this.textures[tetrimino.type];
        tetrimino.blocks().forEach(block =>
            this.hold.add(createBlock(block, texture))
        );
    }

    renderText(state: State) {
        this.infos.children = [];

        const size = 0.3;
        const leftX = -12.5;
        const rightX = this.dimensions.x - 3;

        const createLine = (text: string, x: number, y: number) => {
            const mesh = createFont(text, size);
            mesh.position.set(x, 5.5 - y * size * 2, 2);
            this.infos.add(mesh);
        }

        const timeStr = `${(Math.floor(state.time / 60)).toString().padStart(2, "0")}:${(state.time % 60).toString().padStart(2, "0")}`;

        createLine(`Postris`, leftX, 0);
        createLine(`Time:   ${timeStr}`, leftX, 2);
        createLine(`Level:  ${state.level}`, leftX, 3);
        createLine(`Score:  ${state.score}`, leftX, 4);
        createLine(`Lines:  ${state.lines}`, leftX, 5);
        createLine(`Pieces: ${state.count}`, leftX, 6);

        createLine(`Left: move left`, rightX, 0);
        createLine(`Right:move right`, rightX, 1);
        createLine(`Down: soft drop`, rightX, 2);
        createLine(`Up:   hard drop`, rightX, 3);
        createLine(`Y:    rotate ccw`, rightX, 4);
        createLine(`X:    rotate cw`, rightX, 5);
        createLine(`C:    hold`, rightX, 6);
    }

    async animateClear(lines: number[]) {
        for (const x of range(this.dimensions.x)) {
            for (const y of lines) {
                const block = this.scene.getObjectByName(`${x}.${y}`);
                block?.parent?.remove(block);
            }
            await wait(150 / this.dimensions.x);
        }
    }

    animateDrop(before: Piece, after: Piece) {
        const bounce = 0.1;
        const trail = this.moveToCenter(createTrail(before, after));
        this.scene.add(trail);
        this.scene.position.y -= bounce;
        wait(30).then(() => {
            this.scene.remove(trail);
            this.scene.position.y += bounce;
        });
    }

    animateCamera() {
        const base = this.dimensions.y;

        const before = this.camera.clone();
        before.position.set(0, base * 1.0, base * 0.6);
        before.lookAt(new THREE.Vector3(0, base * 0.6, -30));

        const after = this.camera.clone();
        after.position.set(0, base * 0.3, base * 0.8);
        after.lookAt(new THREE.Vector3(0, base * 0.45, 0));

        const animation = this.mixer.clipAction(createTweenAnimation("camera", 5, before, after));
        animation.setLoop(THREE.LoopOnce, 1);
        animation.clampWhenFinished = true;
        animation.play();
    }

    async animateGameOver(matrix: Matrix) {
        const waitTime = 1500 / this.dimensions.x / this.dimensions.y;
        for (const y of range(this.dimensions.y + 5)) {
            for (const x of range(this.dimensions.x)) {
                const position = new Vec(x, y);
                if (matrix.isFree(position)) {
                    const type = choice(range(7)) as TetriminoType;
                    matrix.set(position, type);
                    this.gameOver.add(createBlock(position, this.textures[type]));
                }
                await wait(waitTime);
            }
        }
    }
}
