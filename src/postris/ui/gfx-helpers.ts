import * as THREE from "three";
import * as fontData from "../assets/font.json";
import { Vec } from "../helpers.js";
import { Piece } from "../logic/piece.js";

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

export function createMaterial(color: string, opacity: number) {
    if (color == "white") return new THREE.MeshStandardMaterial({ color: color });
    //const material = new THREE.MeshStandardMaterial({ map: texture });
    const material = new THREE.MeshStandardMaterial({
        color: color,
        transparent: true,
        opacity: opacity,
        metalness: 0.5,
        emissive: 0.5,
        roughness: 0.5,
    });
    //material.wireframe = true;
    return material;
}

export function createTrail(before: Piece, after: Piece) {
    const minx = Math.min(...before.blocks.map(block => block.x));
    const width = Math.max(...before.blocks.map(block => block.x)) - minx + 1;
    return createCube(
        minx, after.position.y, 1.5,
        width, before.position.y - after.position.y, 0.1,
        before.tetrimino.color, boxGeometry);
}

export function createCube(x: number, y: number, z: number, w: number, h: number, d: number, color: string, geometry: THREE.Geometry, opacity: number = 1) {
    const material = createMaterial(color, opacity);
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

export function createBlock(position: Vec, color: string, opacity: number = 1) {
    const block = createCube(position.x, position.y, 1, 1, 1, 1, color, blockGeometry, opacity);
    block.name = `${position.x}.${position.y}`;
    block.castShadow = true;
    block.receiveShadow = true;
    return block;
}

export const fontMaterial = new THREE.LineBasicMaterial({
    color: "black",
    side: THREE.DoubleSide
});

export function flattenVector(vector: THREE.Vector3) {
    return [vector.x, vector.y, vector.z];
}

export function flattenQuaternion(quaternion: THREE.Quaternion) {
    return [quaternion.x, quaternion.y, quaternion.z, quaternion.w];
}

export function createTweenAnimation(name: string, duration: number, before: THREE.Object3D, after: THREE.Object3D) {
    return new THREE.AnimationClip(name, duration, [
        new THREE.VectorKeyframeTrack(".position",
            [0, duration],
            [...flattenVector(before.position), ...flattenVector(after.position)],
            THREE.InterpolateSmooth
        ),

        new THREE.QuaternionKeyframeTrack(".quaternion",
            [0, duration],
            [...flattenQuaternion(before.quaternion), ...flattenQuaternion(after.quaternion)]
        ),
    ]);
}
