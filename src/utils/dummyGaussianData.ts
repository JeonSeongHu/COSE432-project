export function generateDummyGaussianData(): ArrayBuffer {
  // 더미 데이터 생성을 위한 설정
  const numSplats = 1000; // 스플랫 개수
  const buffer = new ArrayBuffer(4 + numSplats * (4 * 16)); // 헤더(4) + 데이터(4 * 16 = 64바이트/스플랫)
  const view = new DataView(buffer);
  let offset = 0;

  // 헤더: 스플랫 개수
  view.setUint32(offset, numSplats, true);
  offset += 4;

  // 각 스플랫 데이터 생성
  for (let i = 0; i < numSplats; i++) {
    // 위치: 구 형태로 분포
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const radius = 2 + Math.random() * 0.5;

    const posX = radius * Math.sin(phi) * Math.cos(theta);
    const posY = radius * Math.sin(phi) * Math.sin(theta);
    const posZ = radius * Math.cos(phi);

    // 위치 설정
    view.setFloat32(offset, posX, true); offset += 4;
    view.setFloat32(offset, posY, true); offset += 4;
    view.setFloat32(offset, posZ, true); offset += 4;

    // 스케일: 작은 크기로 설정
    const scale = 0.05 + Math.random() * 0.05;
    view.setFloat32(offset, scale, true); offset += 4;
    view.setFloat32(offset, scale, true); offset += 4;
    view.setFloat32(offset, scale, true); offset += 4;

    // 회전: 기본 회전값 설정
    view.setFloat32(offset, 0, true); offset += 4; // qx
    view.setFloat32(offset, 0, true); offset += 4; // qy
    view.setFloat32(offset, 0, true); offset += 4; // qz
    view.setFloat32(offset, 1, true); offset += 4; // qw

    // 색상: 무지개 색상
    const hue = i / numSplats;
    const [red, green, blue] = hslToRgb(hue, 1, 0.5);
    view.setFloat32(offset, red, true); offset += 4;
    view.setFloat32(offset, green, true); offset += 4;
    view.setFloat32(offset, blue, true); offset += 4;

    // 불투명도: 약간 투명하게
    view.setFloat32(offset, 0.7 + Math.random() * 0.3, true); offset += 4;
  }

  return buffer;
}

// HSL to RGB 변환 함수
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  let red, green, blue;

  if (s === 0) {
    red = green = blue = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    red = hue2rgb(p, q, h + 1/3);
    green = hue2rgb(p, q, h);
    blue = hue2rgb(p, q, h - 1/3);
  }

  return [red, green, blue];
} 