import { Vec, wait, range } from "../helpers";
import * as THREE from "three";
import { Piece, Tetrimino, tetriminos } from "../logic/piece";
import { State } from "../logic/state";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { createCube, createWalls, createFont, createTopLight, createFrontLight, fontMaterial, blockGeometry, createBlock, getTexture } from "./gfx-helpers";
import { Matrix } from "../logic/matrix";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";

import { GUI } from "three/examples/jsm/libs/dat.gui.module";

let useDebug = false;
let useComposer = false;

export class Gfx {
    private scene: THREE.Scene;
    private walls: THREE.Group;
    private infos: THREE.Group;
    private matrix: THREE.Group;
    private piece: THREE.Group;
    private preview: THREE.Group;

    private mixer?: THREE.AnimationMixer;

    private readonly camera: THREE.PerspectiveCamera;
    private readonly renderer: THREE.WebGLRenderer;
    private readonly composer: EffectComposer;

    private readonly ambientLight: THREE.AmbientLight;
    private readonly directionalLightTop: THREE.DirectionalLight;
    private readonly directionalLightFront: THREE.DirectionalLight;

    private texture!: THREE.Texture;

    private dimensions: Vec;

    constructor(dimensions: Vec) {
        this.dimensions = dimensions;

        this.scene = new THREE.Scene();
        this.walls = createWalls(dimensions.x, dimensions.y, "darkgray");
        this.infos = new THREE.Group();
        this.moveToCenter(this.walls);
        this.matrix = new THREE.Group();
        this.piece = new THREE.Group();
        this.preview = new THREE.Group();

        const cameraDistance = dimensions.y * 0.65;
        this.camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 50);
        this.camera.position.set(0, dimensions.y * 0.8, cameraDistance);
        this.camera.lookAt(new THREE.Vector3(0, dimensions.y * 0.6, 0));
        this.camera.updateMatrix();

        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        this.directionalLightTop = createTopLight(dimensions);
        this.directionalLightFront = createFrontLight(dimensions);

        this.renderer = new THREE.WebGLRenderer({ alpha: false, antialias: true });
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        //this.renderer.setClearColor("white", 0.75);

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        window.onresize = () => {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.composer.setSize(window.innerWidth, window.innerHeight);
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        };

        const canvas = this.renderer.domElement;
        document.body.style.overflow = "hidden";
        document.body.appendChild(canvas);
        this.setCanvasStyles(canvas);

        this.scene.add(this.walls);
        this.scene.add(this.matrix);
        this.scene.add(this.ambientLight);
        this.scene.add(this.directionalLightTop);
        this.scene.add(this.directionalLightFront);

        if (useDebug) {
            const controls = new OrbitControls(this.camera, canvas)
            controls.enableDamping = true;
            controls.enableKeys = false;
            controls.dampingFactor = 0.25;

            this.scene.add(new THREE.CameraHelper(this.directionalLightTop.shadow.camera));
            this.scene.add(new THREE.DirectionalLightHelper(this.directionalLightTop, 5, "blue"));
            this.scene.add(new THREE.DirectionalLightHelper(this.directionalLightFront, 5, "red"));
        }

        const renderScene = new RenderPass(this.scene, this.camera);

        const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 2, 0.5, 0);
        //this.renderer.toneMappingExposure = Math.pow(2, 4.0);

        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(renderScene);
        this.composer.addPass(bloomPass);

        let params = {
            exposure: 1,
            bloomStrength: 1.5,
            bloomThreshold: 0,
            bloomRadius: 0,
            useDebug: false,
            useBloom: false,    
        };

        const gui = new GUI();
        gui.add(params, 'exposure', 0.1, 2).onChange((value: any) => {
            this.renderer.toneMappingExposure = Math.pow(value, 4.0);
        });
        gui.add(params, 'bloomThreshold', 0.0, 1.0).onChange((value: any) => {
            bloomPass.threshold = Number(value);
        });
        gui.add(params, 'bloomStrength', 0.0, 3.0).onChange((value: any) => {
            bloomPass.strength = Number(value);
        });
        gui.add(params, 'bloomRadius', 0.0, 1.0).step(0.01).onChange((value: any) => {
            bloomPass.radius = Number(value);
        });
        gui.add(params, 'useBloom', 0.0, 1.0).onChange((value: any) => {
            useComposer = Boolean(value);
        });
        gui.add(params, 'useDebug', 0.0, 1.0).onChange((value: any) => {
            useDebug = Boolean(value);
        });
    }

    async init() {
        this.texture = await getTexture("data:image/png;base64,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");
    }

    private setCanvasStyles(canvas: HTMLCanvasElement) {
        canvas.style.position = "absolute";
        canvas.style.top = "0";
        canvas.style.left = "0";
        //canvas.style.zIndex = "1000";
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    private moveToCenter(object: THREE.Object3D) {
        object.position.x -= this.dimensions.x / 2;
        object.position.z = -1;
    }

    render(delta: number) {
        this.mixer?.update(delta / 1000);
        if (useComposer) {
            this.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }

    renderMatrix(matrix: Matrix) {
        this.scene.remove(this.matrix);
        this.matrix = new THREE.Group();
        this.moveToCenter(this.matrix);
        matrix.blocks.forEach(block =>
            this.matrix.add(createBlock(block.position, block.color))
        );
        this.scene.add(this.matrix);
    }

    renderPiece(piece: Piece) {
        this.scene.remove(this.piece);
        this.piece = new THREE.Group();
        this.moveToCenter(this.piece);
        piece.blocks.forEach(block =>
            this.piece.add(createBlock(block, piece.tetrimino.color))
        )
        this.scene.add(this.piece);
    }

    renderPreview(preview: Tetrimino) {
        this.scene.remove(this.preview);
        this.preview = new THREE.Group();
        this.moveToCenter(this.preview);
        preview.blocks().forEach(block =>{
            const mesh = createBlock(block, preview.color);
            mesh.position.add(new THREE.Vector3(11, 8, 3));
            this.preview.add(mesh);
        });
        this.scene.add(this.preview);
    }

    renderText(state: State) {
        this.scene.remove(this.infos);
        this.infos = new THREE.Group();

        const size = 0.3;
        const createLine = (text: string, line: number) => {
            const mesh = createFont(text, size, fontMaterial);
            mesh.position.set(5.5, 5.0 - line * size * 2, 3);
            this.infos.add(mesh);
        }

        const timeStr = `${(Math.floor(state.time / 60)).toString().padStart(2, "0")}:${(state.time % 60).toString().padStart(2, "0")}`;
        createLine(`Postris`, 0);
        createLine(`Time:  ${timeStr}`, 1);
        createLine(`Level: ${state.level}`, 4);
        createLine(`Lines: ${state.lines}`, 3);
        createLine(`Score: ${state.score}`, 2);

        this.scene.add(this.infos);
    }

    async animateClear(lines: number[]) {
        for (const x in range(this.dimensions.x)) {
            for (const y of lines) {
                const block = this.scene.getObjectByName(`${x}.${y}`);
                block?.parent?.remove(block);
            }
            await wait(25);
        }
    }

    async animateDrop(before: Piece, after: Piece) {
        const trail = createCube(
            after.position.x, after.position.y, 0,
            1, before.position.y - after.position.y, 2,
            "red", blockGeometry);
        this.moveToCenter(trail);
        this.scene.add(trail);
        wait(100).then(() =>
            this.scene.remove(trail)
        );
    }
}
