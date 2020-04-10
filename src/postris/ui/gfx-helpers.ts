import * as THREE from "three";
import * as fontData from "../assets/font.json";
import { Vec } from "../helpers.js";
import { Piece } from "../logic/piece.js";

const boxGeometry = new THREE.BoxGeometry(1, 1, 1).translate(0.5, 0.5, 0.5);
const font = new THREE.Font(fontData);
const fontMaterial = new THREE.LineBasicMaterial({ color: "black", side: THREE.DoubleSide });
const wallMaterial = new THREE.MeshStandardMaterial({ color: "white" });

export const blockGeometry = createBlockGeometry();

export async function getTexture(imageUrl: string): Promise<THREE.Texture> {
    return new Promise(resolve => {
        const image = new Image();
        image.crossOrigin = "";
        const texture = new THREE.Texture(image);
        image.onload = () => {
            texture.needsUpdate = true;
            resolve(texture);
        };
        image.src = imageUrl;
    });
}

export function createFont(message: string, size: number) {
    const shapes = font.generateShapes(message.toLowerCase(), size);
    const geometry = new THREE.ShapeBufferGeometry(shapes);
    return new THREE.Mesh(geometry, fontMaterial);
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

function createMaterial(color: string, opacity: number = 1) {
    const material = new THREE.MeshStandardMaterial({
        color: color,
        transparent: opacity < 1,
        opacity: opacity,
        roughness: 0.5,
        metalness: 0.3,
    });
    return material;
}

function createParcelMaterial(color: string, opacity: number = 1, texture?: THREE.Texture) {
    const material = new THREE.MeshStandardMaterial({
        color: color,
        map: texture,
        transparent: opacity < 1,
        opacity: opacity,
        side: THREE.FrontSide
    });
    return material;
}

export function createTrail(before: Piece, after: Piece) {
    const material = createMaterial("gray")
    const minx = Math.min(...before.blocks.map(block => block.x));
    const width = Math.max(...before.blocks.map(block => block.x)) - minx + 1;
    return createCube(
        minx, after.position.y, 1.5,
        width, before.position.y - after.position.y, 0.1,
        boxGeometry, material);
}

export function createCube(x: number, y: number, z: number, w: number, h: number, d: number, geometry: THREE.Geometry, material: THREE.Material) {
    const cube = new THREE.Mesh(geometry, material);
    cube.scale.set(w, h, d);
    cube.position.set(x, y, z);
    return cube;
}

export function createWalls(dimensions: Vec) {
    const walls = new THREE.Group();
    const width = dimensions.x;
    const depth = 3;
    const wallWidth = 100;
    const wallHeight = 100;

    const left = createCube(-wallWidth, 0, 0, wallWidth, wallHeight, depth, boxGeometry, wallMaterial);
    left.receiveShadow = true;
    walls.add(left);

    const right = createCube(width, 0, 0, wallWidth, wallHeight, depth, boxGeometry, wallMaterial);
    right.receiveShadow = true;
    walls.add(right);

    /*
    const back = createCube(0, 0, -1, width, wallHeight, 1, boxGeometry, wallMaterial);
    back.receiveShadow = true;
    walls.add(back);
    */

    const bottom = createCube(-wallWidth, -wallWidth, 0, wallWidth * 2 + width, wallWidth, depth, boxGeometry, wallMaterial);
    bottom.receiveShadow = true;
    walls.add(bottom);

    return walls;
}

export function createTopLight(dimensions: Vec) {
    const light = new THREE.DirectionalLight(0xffffff, 0.4);
    light.position.set(0, dimensions.y + 5, 0);
    light.castShadow = true;
    light.shadow.camera.left = -dimensions.x / 2;
    light.shadow.camera.right = dimensions.x / 2;
    light.shadow.camera.bottom = -2;
    light.shadow.camera.top = 2;
    light.shadow.camera.updateProjectionMatrix();
    return light;
}

export function createFrontLight(dimensions: Vec) {
    const light = new THREE.DirectionalLight(0xffffff, 0.25);
    light.position.set(0, -dimensions.y * 0.1, 10);
    return light;
}

export function createBlock(position: Vec, texture: THREE.Texture, opacity: number = 1) {
    //const material = createMaterial(color, opacity);
    //const block = createCube(position.x, position.y, 1, 1, 1, 1, blockGeometry, material);
    const material = createParcelMaterial("white", opacity, texture);
    const block = createCube(position.x, position.y, 1, 1, 1, 1, boxGeometry, material);
    block.name = `${position.x}.${position.y}`;
    block.castShadow = true;
    block.receiveShadow = true;
    return block;
}

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
