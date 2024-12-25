import { mat4, vec3, quat } from 'gl-matrix';

export class CameraControls {
  private position: vec3;
  private target: vec3;
  private up: vec3;
  private viewMatrix: Float32Array;
  private projectionMatrix: Float32Array;

  private isDragging: boolean = false;
  private lastMouseX: number = 0;
  private lastMouseY: number = 0;

  private rotationSpeed: number = 0.005;
  private zoomSpeed: number = 0.1;
  private minDistance: number = 0.1;
  private maxDistance: number = 100;

  constructor() {
    this.position = vec3.fromValues(0, 0, 5);
    this.target = vec3.fromValues(0, 0, 0);
    this.up = vec3.fromValues(0, 1, 0);
    this.viewMatrix = new Float32Array(16);
    this.projectionMatrix = new Float32Array(16);
    this.updateViewMatrix();
  }

  private updateViewMatrix() {
    mat4.lookAt(this.viewMatrix, this.position, this.target, this.up);
  }

  public updateProjectionMatrix(width: number, height: number) {
    const aspect = width / height;
    mat4.perspective(this.projectionMatrix, Math.PI / 4, aspect, 0.1, 1000.0);
  }

  public startRotate(x: number, y: number) {
    this.isDragging = true;
    this.lastMouseX = x;
    this.lastMouseY = y;
  }

  public stopRotate() {
    this.isDragging = false;
  }

  public rotate(x: number, y: number) {
    if (!this.isDragging) return;

    const deltaX = x - this.lastMouseX;
    const deltaY = y - this.lastMouseY;

    // 현재 카메라 위치를 타겟 중심으로 회전
    const offset = vec3.sub(vec3.create(), this.position, this.target);
    const distance = vec3.length(offset);

    // Y축 회전
    const rotationY = quat.setAxisAngle(quat.create(), this.up, -deltaX * this.rotationSpeed);
    vec3.transformQuat(offset, offset, rotationY);

    // X축 회전
    const right = vec3.cross(vec3.create(), this.up, offset);
    vec3.normalize(right, right);
    const rotationX = quat.setAxisAngle(quat.create(), right, -deltaY * this.rotationSpeed);
    vec3.transformQuat(offset, offset, rotationX);

    // 새로운 카메라 위치 계산
    vec3.add(this.position, this.target, offset);
    vec3.normalize(offset, offset);
    vec3.scale(offset, offset, distance);

    this.updateViewMatrix();

    this.lastMouseX = x;
    this.lastMouseY = y;
  }

  public zoom(delta: number) {
    const offset = vec3.sub(vec3.create(), this.position, this.target);
    const distance = vec3.length(offset);
    const newDistance = Math.max(
      this.minDistance,
      Math.min(this.maxDistance, distance * (1 - delta * this.zoomSpeed))
    );

    vec3.normalize(offset, offset);
    vec3.scale(offset, offset, newDistance);
    vec3.add(this.position, this.target, offset);

    this.updateViewMatrix();
  }

  public getViewMatrix(): Float32Array {
    return this.viewMatrix;
  }

  public getProjectionMatrix(): Float32Array {
    return this.projectionMatrix;
  }

  public setPosition(x: number, y: number, z: number) {
    this.position = vec3.fromValues(x, y, z);
    this.updateViewMatrix();
  }

  public setTarget(x: number, y: number, z: number) {
    this.target = vec3.fromValues(x, y, z);
    this.updateViewMatrix();
  }
} 