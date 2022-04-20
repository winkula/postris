import { Vec } from "../helpers";

export enum InputType {
  MoveLeft,
  MoveRight,
  SoftDrop,
  HardDrop,
  RotateCcw,
  RotateCw,
  Hold,
}

enum KeyCode {
  Left = 37,
  Up = 38,
  Right = 39,
  Down = 40,
  Y = 89,
  X = 88,
  C = 67,
}

interface InputMap {
  [key: number]: InputType | undefined;
}

const getVec = (touch: Touch) => new Vec(touch.screenX, touch.screenY);

export class Input {
  handler?: (inputType: InputType) => void;
  private width: number = window.innerWidth;
  private height: number = window.innerHeight;

  private touchstartTime = 0;
  private touchstartPosition!: Vec;
  private touchTimeThreshold = 1.0 * 1000;
  private touchDistanceThreshold = 30;
  private thresholdX = 0.4;
  private thresholdY = 0.4;

  private inputMap: InputMap = {
    [KeyCode.Left]: InputType.MoveLeft,
    [KeyCode.Right]: InputType.MoveRight,
    [KeyCode.Up]: InputType.HardDrop,
    [KeyCode.Down]: InputType.SoftDrop,
    [KeyCode.Y]: InputType.RotateCw,
    [KeyCode.X]: InputType.RotateCcw,
    [KeyCode.C]: InputType.Hold,
  };

  constructor() {
    window.addEventListener("resize", () => {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
    });

    window.addEventListener("keydown", (event: KeyboardEvent) => {
      const inputType = this.inputMap[event.keyCode];
      if (inputType !== undefined) {
        this.handler?.(inputType);
      }
    });

    window.addEventListener("touchstart", (event: TouchEvent) => {
      this.touchstartTime = Date.now();
      this.touchstartPosition = getVec(event.touches[0]);
    });

    window.addEventListener("touchend", (event: TouchEvent) => {
      if (Date.now() - this.touchstartTime > this.touchTimeThreshold) {
        return; // to slow
      }

      const delta = getVec(event.changedTouches[0]).sub(
        this.touchstartPosition
      );
      const angle = delta.angle;
      const magnitude = delta.magnitude;

      if (magnitude < this.touchDistanceThreshold) {
        return; // to short
      }

      const threshold = 0.2;
      if (angle > Math.PI / 2 - threshold && angle < Math.PI / 2 + threshold) {
        // swipe down
        this.handler?.(InputType.HardDrop);
      }
    });

    window.addEventListener("click", (event: MouseEvent) => {
      if (this.isLeft(event.x, this.thresholdX)) {
        this.handler?.(InputType.MoveLeft);
        return;
      }
      if (this.isRight(event.x, this.thresholdX)) {
        this.handler?.(InputType.MoveRight);
        return;
      }
      if (this.isBottom(event.y, this.thresholdY)) {
        this.handler?.(InputType.RotateCw);
        return;
      }
      if (this.isTop(event.y, this.thresholdY)) {
        this.handler?.(InputType.Hold);
        return;
      }
    });
  }

  private isTop = (y: number, threshold: number) => y < this.height * threshold;
  private isBottom = (y: number, threshold: number) =>
    y > this.height * (1 - threshold);
  private isLeft = (x: number, threshold: number) => x < this.width * threshold;
  private isRight = (x: number, threshold: number) =>
    x > this.width * (1 - threshold);
}
