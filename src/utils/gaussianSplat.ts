// WebGL 셰이더 소스
const vertexShaderSource = `
  attribute vec3 position;
  attribute vec3 color;
  attribute vec3 scale;
  attribute vec4 rotation;

  uniform mat4 viewMatrix;
  uniform mat4 projectionMatrix;

  varying vec3 vColor;

  void main() {
    vec4 worldPosition = vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * worldPosition;
    gl_Position = projectionMatrix * viewPosition;
    
    // 가우시안 스플랫의 크기 조정
    gl_PointSize = scale.x * (1.0 / -viewPosition.z);
    
    vColor = color;
  }
`;

const fragmentShaderSource = `
  precision mediump float;
  varying vec3 vColor;

  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float r2 = dot(coord, coord);
    if (r2 > 0.25) {
      discard;
    }
    
    float alpha = exp(-r2 * 8.0);
    gl_FragColor = vec4(vColor, alpha);
  }
`;

export interface SplatChunk {
  positions: Float32Array;
  colors: Float32Array;
  scales: Float32Array;
  rotations: Float32Array;
  count: number;
}

export interface SplatData {
  chunks: SplatChunk[];
  totalCount: number;
}

const CHUNK_SIZE = 50;

export class GaussianSplatRenderer {
  private gl: WebGLRenderingContext;
  private program: WebGLProgram;
  private buffers: {
    position: WebGLBuffer;
    color: WebGLBuffer;
    scale: WebGLBuffer;
    rotation: WebGLBuffer;
  };
  private currentChunkIndex: number = 0;
  private chunks: SplatChunk[] = [];

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
    this.program = this.createProgram();
    this.buffers = this.createBuffers();
  }

  private createShader(type: number, source: string): WebGLShader {
    const shader = this.gl.createShader(type);
    if (!shader) throw new Error('셰이더 생성 실패');

    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const info = this.gl.getShaderInfoLog(shader);
      this.gl.deleteShader(shader);
      throw new Error('셰이더 컴파일 실패: ' + info);
    }

    return shader;
  }

  private createProgram(): WebGLProgram {
    const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);

    const program = this.gl.createProgram();
    if (!program) throw new Error('프로��램 생성 실패');

    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      const info = this.gl.getProgramInfoLog(program);
      throw new Error('프로그램 링크 실패: ' + info);
    }

    return program;
  }

  private createBuffers() {
    const position = this.gl.createBuffer();
    const color = this.gl.createBuffer();
    const scale = this.gl.createBuffer();
    const rotation = this.gl.createBuffer();

    if (!position || !color || !scale || !rotation) {
      throw new Error('버퍼 생성 실패');
    }

    return { position, color, scale, rotation };
  }

  public loadData(data: SplatData) {
    this.chunks = data.chunks;
    this.currentChunkIndex = 0;
  }

  public render(viewMatrix: Float32Array, projectionMatrix: Float32Array) {
    if (this.chunks.length === 0) return;

    const currentChunk = this.chunks[this.currentChunkIndex];

    this.gl.useProgram(this.program);

    // 유니폼 설정
    const viewMatrixLocation = this.gl.getUniformLocation(this.program, 'viewMatrix');
    const projectionMatrixLocation = this.gl.getUniformLocation(this.program, 'projectionMatrix');

    this.gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);
    this.gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);

    // 어트리뷰트 설정
    const positionLocation = this.gl.getAttribLocation(this.program, 'position');
    const colorLocation = this.gl.getAttribLocation(this.program, 'color');
    const scaleLocation = this.gl.getAttribLocation(this.program, 'scale');
    const rotationLocation = this.gl.getAttribLocation(this.program, 'rotation');

    this.gl.enableVertexAttribArray(positionLocation);
    this.gl.enableVertexAttribArray(colorLocation);
    this.gl.enableVertexAttribArray(scaleLocation);
    this.gl.enableVertexAttribArray(rotationLocation);

    // 현재 청크 데이터 로드
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.position);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, currentChunk.positions, this.gl.STATIC_DRAW);
    this.gl.vertexAttribPointer(positionLocation, 3, this.gl.FLOAT, false, 0, 0);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.color);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, currentChunk.colors, this.gl.STATIC_DRAW);
    this.gl.vertexAttribPointer(colorLocation, 3, this.gl.FLOAT, false, 0, 0);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.scale);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, currentChunk.scales, this.gl.STATIC_DRAW);
    this.gl.vertexAttribPointer(scaleLocation, 3, this.gl.FLOAT, false, 0, 0);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.rotation);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, currentChunk.rotations, this.gl.STATIC_DRAW);
    this.gl.vertexAttribPointer(rotationLocation, 4, this.gl.FLOAT, false, 0, 0);

    // 렌더링
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    this.gl.drawArrays(this.gl.POINTS, 0, currentChunk.count);

    // 다음 청크로 이동
    this.currentChunkIndex = (this.currentChunkIndex + 1) % this.chunks.length;
  }

  public dispose() {
    this.gl.deleteBuffer(this.buffers.position);
    this.gl.deleteBuffer(this.buffers.color);
    this.gl.deleteBuffer(this.buffers.scale);
    this.gl.deleteBuffer(this.buffers.rotation);
    this.gl.deleteProgram(this.program);
    this.chunks = [];
  }
}

export async function parseSplatFile(buffer: ArrayBuffer): Promise<SplatData> {
  return new Promise((resolve, reject) => {
    try {
      const view = new DataView(buffer);
      let offset = 0;

      // 헤일 크기 확인
      if (buffer.byteLength < 4) {
        throw new Error('Invalid splat file: too small');
      }

      // 헤더 파싱
      const totalCount = view.getUint32(offset, true);
      offset += 4;

      // 예상되는 파일 크기 확인
      const bytesPerSplat = (3 + 3 + 3 + 4) * 4; // position(3) + color(3) + scale(3) + rotation(4) floats
      const expectedSize = 4 + totalCount * bytesPerSplat;
      
      if (buffer.byteLength < expectedSize) {
        throw new Error('Invalid splat file: incomplete data');
      }

      const chunks: SplatChunk[] = [];
      let processedCount = 0;

      function processNextChunk() {
        try {
          const remainingCount = totalCount - processedCount;
          if (remainingCount <= 0) {
            resolve({ chunks, totalCount });
            return;
          }

          const chunkCount = Math.min(CHUNK_SIZE, remainingCount);
          const chunkSize = chunkCount * bytesPerSplat;

          // 남은 버퍼 크기 확인
          const remainingBuffer = buffer.byteLength - offset;
          if (remainingBuffer < chunkSize) {
            throw new Error('Unexpected end of file');
          }

          // 청크 데이터 배열 생성
          const positions = new Float32Array(chunkCount * 3);
          const colors = new Float32Array(chunkCount * 3);
          const scales = new Float32Array(chunkCount * 3);
          const rotations = new Float32Array(chunkCount * 4);

          // 청크 데이터 파싱
          for (let i = 0; i < chunkCount; i++) {
            // 각 데이터 읽기 전에 범위 확인
            if (offset + 52 > buffer.byteLength) { // 52 = (3 + 3 + 3 + 4) * 4
              throw new Error('Unexpected end of file while reading splat data');
            }

            // 위치
            for (let j = 0; j < 3; j++) {
              positions[i * 3 + j] = view.getFloat32(offset, true);
              offset += 4;
            }

            // 색상
            for (let j = 0; j < 3; j++) {
              colors[i * 3 + j] = view.getFloat32(offset, true);
              offset += 4;
            }

            // 스케일
            for (let j = 0; j < 3; j++) {
              scales[i * 3 + j] = view.getFloat32(offset, true);
              offset += 4;
            }

            // 회전
            for (let j = 0; j < 4; j++) {
              rotations[i * 4 + j] = view.getFloat32(offset, true);
              offset += 4;
            }
          }

          chunks.push({
            positions,
            colors,
            scales,
            rotations,
            count: chunkCount
          });

          processedCount += chunkCount;

          // 다음 청크 처리를 위해 setTimeout 사용
          setTimeout(processNextChunk, 0);
        } catch (error) {
          reject(error);
        }
      }

      // 첫 번째 청크 처리 시작
      processNextChunk();
    } catch (error) {
      reject(error);
    }
  });
} 