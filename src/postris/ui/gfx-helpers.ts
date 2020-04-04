import * as THREE from "three";
import * as fontData from "../assets/font.json";
import { Matrix } from "../logic/matrix.js";
import { Vec } from "../helpers.js";

const boxGeometry = new THREE.BoxGeometry(1, 1, 1).translate(0.5, 0.5, 0.5);
const font = new THREE.Font(fontData);
export const blockGeometry = createBlockGeometry();

export async function getTexture(imageUrl: string): Promise<THREE.Texture> {
    return new Promise(resolve => {
        const image = new Image();
        const texture = new THREE.Texture(image);
        image.onload = () => {
            texture.needsUpdate = true;
            resolve(texture);
        };
        image.src = imageUrl;
    });
}

export function createFont(message: string, size: number, material: THREE.Material) {
    const shapes = font.generateShapes(message.toLowerCase(), size);
    const geometry = new THREE.ShapeBufferGeometry(shapes);
    return new THREE.Mesh(geometry, material);
}

export function createBlockGeometry() {
    const size = 1;
    const bevel = 0.15;
    const shapeSize = size - 2 * bevel;
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0, shapeSize);
    shape.lineTo(shapeSize, shapeSize);
    shape.lineTo(shapeSize, 0);
    shape.lineTo(0, 0);

    const extrudeSettings = {
        steps: 1,
        depth: size - 2 * bevel,
        bevelEnabled: true,
        bevelThickness: bevel,
        bevelSize: bevel,
        bevelOffset: 0,
        bevelSegments: 1
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings)
        .translate(bevel, bevel, bevel);
}

export function createMaterial(color: string) {
    if (color == "white") return new THREE.MeshStandardMaterial({ color: color });
    //const material = new THREE.MeshStandardMaterial({ map: texture });
    const material = new THREE.MeshStandardMaterial({ color: color });
    //material.wireframe = true;
    return material;
}

export function createCube(x: number, y: number, z: number, w: number, h: number, d: number, color: string, geometry: THREE.Geometry) {
    const material = createMaterial(color);
    //material.wireframe = true;
    //const material = new THREE.MeshToonMaterial({ color: color });
    //const material = new THREE.MeshPhongMaterial({ color: color });
    const cube = new THREE.Mesh(geometry, material);
    cube.scale.set(w, h, d);
    cube.position.set(x, y, z);
    return cube;
}

export function createWalls(width: number, height: number, color: string) {
    const walls = new THREE.Group();
    const depth = 3;
    const wallWidth = 100;
    const wallHeight = 100;

    const left = createCube(-wallWidth, 0, 0, wallWidth, wallHeight, depth, color, boxGeometry);
    left.receiveShadow = true;
    walls.add(left);

    const right = createCube(width, 0, 0, wallWidth, wallHeight, depth, color, boxGeometry);
    right.receiveShadow = true;
    walls.add(right);

    const bottom = createCube(-wallWidth, -wallWidth, 0, wallWidth * 2 + width, wallWidth, depth, color, boxGeometry);
    bottom.receiveShadow = true;
    walls.add(bottom);

    return walls;
}

export function createTopLight(dimensions: Vec) {
    const light = new THREE.DirectionalLight(0xffffff, 0.5);
    light.position.set(0, dimensions.y, 0);
    light.castShadow = true;
    light.shadow.camera.left = -dimensions.x / 2;
    light.shadow.camera.right = dimensions.x / 2;
    light.shadow.camera.bottom = -2;
    light.shadow.camera.top = 2;
    light.shadow.camera.updateProjectionMatrix();
    return light;
}

export function createFrontLight(dimensions: Vec) {
    const light = new THREE.DirectionalLight(0xffffff, 0.3);
    light.position.set(0, dimensions.y * 0.5, 10);
    return light;
}

export function createBlock(position: Vec, color: string, name?: string) {
    const block = createCube(position.x, position.y, 1, 1, 1, 1, color, blockGeometry);
    block.name = `${position.x}.${position.y}`;
    block.castShadow = true;
    block.receiveShadow = true;
    return block;
}

export const fontMaterial = new THREE.LineBasicMaterial({
    color: "white",
    side: THREE.DoubleSide
});
