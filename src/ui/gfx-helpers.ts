import {
  BoxGeometry,
  Mesh,
  LineBasicMaterial,
  MeshStandardMaterial,
  DoubleSide,
  FrontSide,
  Texture,
  ShapeGeometry,
  Group,
  DirectionalLight,
  AnimationClip,
  VectorKeyframeTrack,
  QuaternionKeyframeTrack,
  InterpolateSmooth,
  BufferGeometry,
  Material,
  Vector3,
  Quaternion,
  Object3D,
} from "three";
import { Font } from "three/examples/jsm/loaders/FontLoader.js"
import * as fontData from "../assets/font.json";
import { Vec } from "../helpers.js";
import { Piece } from "../logic/piece.js";

const boxGeometry = new BoxGeometry(1, 1, 1).translate(0.5, 0.5, 0.5);
const font = new Font(fontData);
const fontMaterial = new LineBasicMaterial({
  color: "black",
  side: DoubleSide,
});
const wallMaterial = new MeshStandardMaterial({ color: "white" });

export async function getTexture(imageUrl: string): Promise<Texture> {
  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = "";
    const texture = new Texture(image);
    image.onload = () => {
      texture.needsUpdate = true;
      resolve(texture);
    };
    image.src = imageUrl;
  });
}

export function createFont(message: string, size: number) {
  const shapes = font.generateShapes(message.toLowerCase(), size);
  const geometry = new ShapeGeometry(shapes);
  return new Mesh(geometry, fontMaterial);
}

function createMaterial(color: string, opacity: number = 1) {
  const material = new MeshStandardMaterial({
    color: color,
    transparent: opacity < 1,
    opacity: opacity,
    roughness: 0.5,
    metalness: 0.3,
  });
  return material;
}

function createParcelMaterial(opacity: number = 1, texture?: Texture) {
  const material = new MeshStandardMaterial({
    color: 0xffffff,
    map: texture,
    transparent: opacity < 1,
    opacity: opacity,
    side: FrontSide,
  });
  return material;
}

export function createTrail(before: Piece, after: Piece) {
  const material = createMaterial("gray");
  const minx = Math.min(...before.blocks.map((block) => block.x));
  const width = Math.max(...before.blocks.map((block) => block.x)) - minx + 1;
  return createCube(
    minx,
    after.position.y,
    1.5,
    width,
    before.position.y - after.position.y,
    0.1,
    boxGeometry,
    material
  );
}

export function createCube(
  x: number,
  y: number,
  z: number,
  w: number,
  h: number,
  d: number,
  geometry: BufferGeometry,
  material: Material
) {
  const cube = new Mesh(geometry, material);
  cube.scale.set(w, h, d);
  cube.position.set(x, y, z);
  return cube;
}

export function createWalls(dimensions: Vec) {
  const walls = new Group();
  const width = dimensions.x;
  const depth = 3;
  const wallWidth = 100;
  const wallWidthBottom = 100;
  const wallHeight = 100;

  const left = createCube(
    -wallWidth,
    0,
    0,
    wallWidth,
    wallHeight,
    depth,
    boxGeometry,
    wallMaterial
  );
  walls.add(left);

  const right = createCube(
    width,
    0,
    0,
    wallWidth,
    wallHeight,
    depth,
    boxGeometry,
    wallMaterial
  );
  walls.add(right);

  const bottom = createCube(
    -wallWidthBottom,
    -wallWidthBottom,
    0,
    wallWidthBottom * 2 + width,
    wallWidthBottom,
    depth,
    boxGeometry,
    wallMaterial
  );
  bottom.receiveShadow = true;
  walls.add(bottom);

  return walls;
}

export function createTopLight(dimensions: Vec) {
  const light = new DirectionalLight(0xffffff, 0.25);
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
  const light = new DirectionalLight(0xffffff, 0.35);
  light.position.set(0, -dimensions.y * 0.1, 10);
  return light;
}

export function createBlock(
  position: Vec,
  texture: Texture,
  opacity: number = 1
) {
  const material = createParcelMaterial(opacity, texture);
  const block = createCube(
    position.x,
    position.y,
    1,
    1,
    1,
    1,
    boxGeometry,
    material
  );
  block.name = `${position.x}.${position.y}`;
  block.castShadow = true;
  block.receiveShadow = true;
  return block;
}

export function flattenVector(vector: Vector3) {
  return [vector.x, vector.y, vector.z];
}

export function flattenQuaternion(quaternion: Quaternion) {
  return [quaternion.x, quaternion.y, quaternion.z, quaternion.w];
}

export function createTweenAnimation(
  name: string,
  duration: number,
  before: Object3D,
  after: Object3D
) {
  return new AnimationClip(name, duration, [
    new VectorKeyframeTrack(
      ".position",
      [0, duration],
      [...flattenVector(before.position), ...flattenVector(after.position)],
      InterpolateSmooth
    ),

    new QuaternionKeyframeTrack(
      ".quaternion",
      [0, duration],
      [
        ...flattenQuaternion(before.quaternion),
        ...flattenQuaternion(after.quaternion),
      ]
    ),
  ]);
}
