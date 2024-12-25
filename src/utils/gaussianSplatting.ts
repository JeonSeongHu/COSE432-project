import * as THREE from 'three';

interface GaussianSplat {
  position: THREE.Vector3;
  scale: THREE.Vector3;
  rotation: THREE.Quaternion;
  opacity: number;
  color: THREE.Color;
}

export class GaussianSplatLoader {
  private static instance: GaussianSplatLoader;
  private splats: GaussianSplat[] = [];

  private constructor() {}

  public static getInstance(): GaussianSplatLoader {
    if (!GaussianSplatLoader.instance) {
      GaussianSplatLoader.instance = new GaussianSplatLoader();
    }
    return GaussianSplatLoader.instance;
  }

  public async loadFromArrayBuffer(buffer: ArrayBuffer): Promise<void> {
    const view = new DataView(buffer);
    let offset = 0;

    // 헤더 정보 읽기
    const numSplats = view.getUint32(offset, true);
    offset += 4;

    this.splats = [];

    for (let i = 0; i < numSplats; i++) {
      // 위치 읽기
      const x = view.getFloat32(offset, true);
      offset += 4;
      const y = view.getFloat32(offset, true);
      offset += 4;
      const z = view.getFloat32(offset, true);
      offset += 4;

      // 스케일 읽기
      const sx = view.getFloat32(offset, true);
      offset += 4;
      const sy = view.getFloat32(offset, true);
      offset += 4;
      const sz = view.getFloat32(offset, true);
      offset += 4;

      // 회전 읽기
      const qx = view.getFloat32(offset, true);
      offset += 4;
      const qy = view.getFloat32(offset, true);
      offset += 4;
      const qz = view.getFloat32(offset, true);
      offset += 4;
      const qw = view.getFloat32(offset, true);
      offset += 4;

      // 색상 읽기
      const r = view.getFloat32(offset, true);
      offset += 4;
      const g = view.getFloat32(offset, true);
      offset += 4;
      const b = view.getFloat32(offset, true);
      offset += 4;

      // 불투명도 읽기
      const opacity = view.getFloat32(offset, true);
      offset += 4;

      this.splats.push({
        position: new THREE.Vector3(x, y, z),
        scale: new THREE.Vector3(sx, sy, sz),
        rotation: new THREE.Quaternion(qx, qy, qz, qw),
        opacity,
        color: new THREE.Color(r, g, b)
      });
    }
  }

  public getSplats(): GaussianSplat[] {
    return this.splats;
  }

  public createMesh(): THREE.Points {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.splats.length * 3);
    const colors = new Float32Array(this.splats.length * 3);
    const sizes = new Float32Array(this.splats.length);
    const opacities = new Float32Array(this.splats.length);

    this.splats.forEach((splat, i) => {
      positions[i * 3] = splat.position.x;
      positions[i * 3 + 1] = splat.position.y;
      positions[i * 3 + 2] = splat.position.z;

      colors[i * 3] = splat.color.r;
      colors[i * 3 + 1] = splat.color.g;
      colors[i * 3 + 2] = splat.color.b;

      sizes[i] = (splat.scale.x + splat.scale.y + splat.scale.z) / 3;
      opacities[i] = splat.opacity;
    });

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));

    const material = new THREE.ShaderMaterial({
      vertexShader: `
        attribute float size;
        attribute float opacity;
        varying float vOpacity;
        void main() {
          vOpacity = opacity;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying float vOpacity;
        void main() {
          vec2 xy = gl_PointCoord.xy - vec2(0.5);
          float r = length(xy);
          if (r > 0.5) discard;
          gl_FragColor = vec4(1.0, 1.0, 1.0, vOpacity * (1.0 - r * 2.0));
        }
      `,
      transparent: true,
      vertexColors: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    return new THREE.Points(geometry, material);
  }
} 