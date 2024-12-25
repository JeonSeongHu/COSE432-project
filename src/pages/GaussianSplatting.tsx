import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../components/viewer/VenueViewer.module.css';

declare global {
  interface Window {
    canvas: HTMLCanvasElement | null;
    gl?: WebGLRenderingContext;
    cameras?: any[];
    camera?: any;
    url?: string;
    debugLog?: (message: string) => void;
    vertexShader?: WebGLShader;
    fragmentShader?: WebGLShader;
    shaderProgram?: WebGLProgram;
    viewMatrix?: number[];
    defaultViewMatrix?: number[];
    updateViewMatrix?: (matrix: number[]) => void;
    requestRender?: () => void;
  }
}

interface GaussianSplattingProps {
  onClose?: () => void;
  onSectionSelect?: (sectionId: string) => void;
  onToggleSection?: (sectionId: string) => void;
}

interface SectionViewpoint {
  position: [number, number, number];
  rotation: [number, number, number];
  target: [number, number, number];
}

const SECTION_VIEWPOINTS: { [key: string]: SectionViewpoint } = {
  'FLOOR-A': {
    position: [-3.0, 1.6, 4.0],
    rotation: [0, 0.3, 0],
    target: [0, 1, -2]
  },
  'FLOOR-B': {
    position: [0, 1.6, 4.0],
    rotation: [0, 0, 0],
    target: [0, 1, -2]
  },
  'FLOOR-C': {
    position: [3.0, 1.6, 4.0],
    rotation: [0, -0.3, 0],
    target: [0, 1, -2]
  },
  '1F-LEFT': {
    position: [-4.0, 3.0, 4.0],
    rotation: [0.1, 0.4, 0],
    target: [0, 1, -2]
  },
  '1F-RIGHT': {
    position: [4.0, 3.0, 4.0],
    rotation: [0.1, -0.4, 0],
    target: [0, 1, -2]
  }
};

// 행렬 연산 유틸리티 함수들
const multiply4 = (a: number[], b: number[]): number[] => {
  return [
    b[0] * a[0] + b[1] * a[4] + b[2] * a[8] + b[3] * a[12],
    b[0] * a[1] + b[1] * a[5] + b[2] * a[9] + b[3] * a[13],
    b[0] * a[2] + b[1] * a[6] + b[2] * a[10] + b[3] * a[14],
    b[0] * a[3] + b[1] * a[7] + b[2] * a[11] + b[3] * a[15],
    b[4] * a[0] + b[5] * a[4] + b[6] * a[8] + b[7] * a[12],
    b[4] * a[1] + b[5] * a[5] + b[6] * a[9] + b[7] * a[13],
    b[4] * a[2] + b[5] * a[6] + b[6] * a[10] + b[7] * a[14],
    b[4] * a[3] + b[5] * a[7] + b[6] * a[11] + b[7] * a[15],
    b[8] * a[0] + b[9] * a[4] + b[10] * a[8] + b[11] * a[12],
    b[8] * a[1] + b[9] * a[5] + b[10] * a[9] + b[11] * a[13],
    b[8] * a[2] + b[9] * a[6] + b[10] * a[10] + b[11] * a[14],
    b[8] * a[3] + b[9] * a[7] + b[10] * a[11] + b[11] * a[15],
    b[12] * a[0] + b[13] * a[4] + b[14] * a[8] + b[15] * a[12],
    b[12] * a[1] + b[13] * a[5] + b[14] * a[9] + b[15] * a[13],
    b[12] * a[2] + b[13] * a[6] + b[14] * a[10] + b[15] * a[14],
    b[12] * a[3] + b[13] * a[7] + b[14] * a[11] + b[15] * a[15],
  ];
};

const createViewMatrix = (position: number[], target: number[], up: number[] = [0, 1, 0]): number[] => {
  // 카메라 방향 벡터 계산
  const zAxis = normalize(subtract(position, target));  // 카메라가 바라보는 방향
  const xAxis = normalize(cross(up, zAxis));           // 오른쪽 방향
  const yAxis = normalize(cross(zAxis, xAxis));        // 위쪽 방향

  // 회전 행렬과 이동 행렬을 결합
  return [
    xAxis[0], xAxis[1], xAxis[2], 0,
    yAxis[0], yAxis[1], yAxis[2], 0,
    zAxis[0], zAxis[1], zAxis[2], 0,
    -(xAxis[0] * position[0] + xAxis[1] * position[1] + xAxis[2] * position[2]),
    -(yAxis[0] * position[0] + yAxis[1] * position[1] + yAxis[2] * position[2]),
    -(zAxis[0] * position[0] + zAxis[1] * position[1] + zAxis[2] * position[2]),
    1
  ];
};

const normalize = (v: number[]): number[] => {
  const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  return [v[0] / length, v[1] / length, v[2] / length];
};

const subtract = (a: number[], b: number[]): number[] => {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
};

const cross = (a: number[], b: number[]): number[] => {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ];
};

const GaussianSplatting: React.FC<GaussianSplattingProps> = ({
  onClose,
  onSectionSelect: externalOnSectionSelect,
  onToggleSection: externalOnToggleSection
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const [isEgocentric, setIsEgocentric] = useState(false);
  const [viewMode, setViewMode] = useState<'gaussian' | 'section'>('gaussian');
  const [selectedSection, setSelectedSection] = useState<string | undefined>(undefined);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);

  useEffect(() => {
    // 디버그 로그 함수 설정
    window.debugLog = (message: string) => {
      console.log(`[Debug] ${message}`);
    };

    // canvas 초기화 함수
    const initCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        console.error('Canvas element not found');
        return;
      }

      console.log('Initializing canvas...');
      // 캔버스 크기 설정
      const pixelRatio = window.devicePixelRatio || 1;
      const width = window.innerWidth * pixelRatio;
      const height = window.innerHeight * pixelRatio;

      canvas.width = width;
      canvas.height = height;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.display = 'block';
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      
      window.canvas = canvas;
      console.log('Canvas dimensions:', { width, height, pixelRatio });

      return canvas;
    };

    // 먼저 canvas 초기화
    const canvas = initCanvas();
    if (!canvas) return;

    // main.js 내용을 함수로 래핑
    const initMainScript = () => {
      console.log('Initializing main script...');
      
      // cameras 배열 초기화는 main.js에서 하도록 제거
      window.url = '/splat/model.splat';
      console.log('Splat URL set:', window.url);

      const script = document.createElement('script');
      script.src = '/splat/main.js';
      script.type = 'text/javascript';
      
      script.onload = () => {
        console.log('Main script loaded');
        
        // viewMatrix와 requestRender 함수 설정
        window.updateViewMatrix = (matrix: number[]) => {
          window.viewMatrix = matrix;
          // 뷰 매트릭스 직접 적용
          if ((window as any).gl && (window as any).u_view) {
            (window as any).gl.uniformMatrix4fv((window as any).u_view, false, matrix);
            (window as any).gl?.clear((window as any).gl?.COLOR_BUFFER_BIT);
            if ((window as any).vertexCount > 0) {
              (window as any).gl.drawArraysInstanced(
                (window as any).gl.TRIANGLE_FAN,
                0,
                4,
                (window as any).vertexCount
              );
            }
          }
        };
        
        // 초기 시점 설정
        if (selectedSection) {
          updateViewpoint(selectedSection);
        }
      };

      script.onerror = (error) => {
        console.error('Script loading error:', error);
      };

      document.body.appendChild(script);
    };

    // 이전 스크립트 제거 후 초기화
    const existingScript = document.querySelector('script[src="/splat/main.js"]');
    if (existingScript) {
      document.body.removeChild(existingScript);
      console.log('Previous script removed');
    }

    // 초기화 실행
    initMainScript();

    // 윈도우 리사이즈 이벤트 처리
    const handleResize = () => {
      console.log('Window resized');
      initCanvas();
    };
    window.addEventListener('resize', handleResize);

    // 시점 변경 시 카메라 위치 업데이트
    const updateCameraPosition = () => {
      if (selectedSection) {
        // 선택된 섹션에 따른 카메라 위치 설정
        const positions: { [key: string]: number[] } = {
          'FLOOR-A': [-3, 1.6, 4],
          'FLOOR-B': [0, 1.6, 4],
          'FLOOR-C': [3, 1.6, 4],
          '1F-LEFT': [-4, 3, 4],
          '1F-RIGHT': [4, 3, 4]
        };

        const position = positions[selectedSection];
        if (position && window.camera) {
          window.camera.position = position;
        }
      }
    };

    if (isEgocentric) {
      updateCameraPosition();
    }

    return () => {
      // 정리 작업
      window.removeEventListener('resize', handleResize);
      const scriptToRemove = document.querySelector('script[src="/splat/main.js"]');
      if (scriptToRemove) {
        document.body.removeChild(scriptToRemove);
      }
      
      // 전역 변수 정리
      window.canvas = null;
      window.gl = undefined;
      if (window.cameras) {
        delete window.cameras;
      }
      if (window.camera) {
        delete window.camera;
      }
      if (window.url) {
        delete window.url;
      }
      delete window.debugLog;
      console.log('Cleanup completed');
    };
  }, []);

  // 시점 업데이트 함수 수정
  const updateViewpoint = (sectionId: string) => {
    const viewpoint = SECTION_VIEWPOINTS[sectionId];
    if (!viewpoint || !window.updateViewMatrix) return;

    // 뷰 매트릭스 생성
    const viewMatrix = createViewMatrix(
      viewpoint.position,
      viewpoint.target
    );

    // 회전 적용
    const rotationMatrix = [
      Math.cos(viewpoint.rotation[1]), 0, Math.sin(viewpoint.rotation[1]), 0,
      0, 1, 0, 0,
      -Math.sin(viewpoint.rotation[1]), 0, Math.cos(viewpoint.rotation[1]), 0,
      0, 0, 0, 1
    ];

    // 최종 매트릭스 계산
    const finalMatrix = multiply4(viewMatrix, rotationMatrix);
    
    // 전역 뷰 매트릭스 업데이트
    window.updateViewMatrix(finalMatrix);
    
    // 렌더링 요청
    if (window.requestRender) {
      window.requestRender();
    }
  };

  // 섹션 선택 시 시점 업데이트
  useEffect(() => {
    if (selectedSection && isEgocentric) {
      updateViewpoint(selectedSection);
    }
  }, [selectedSection, isEgocentric]);

  const handleSectionSelect = (sectionId: string) => {
    setSelectedSection(sectionId);
    if (externalOnSectionSelect) {
      externalOnSectionSelect(sectionId);
    }
    
    // 시점 업데이트 호출
    updateViewpoint(sectionId);
  };

  const handleToggleSection = (sectionId: string) => {
    setSelectedSections(prev => {
      const newSections = prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId];
      
      if (externalOnToggleSection) {
        externalOnToggleSection(sectionId);
      }
      
      return newSections;
    });
  };

  const handleViewButtonClick = () => {
    if (isEgocentric && !selectedSection) {
      setIsEgocentric(false);
    } else {
      setIsEgocentric(!isEgocentric);
      if (selectedSection) {
        updateViewpoint(selectedSection);
      }
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  const handleToggleViewMode = () => {
    setViewMode(prev => prev === 'gaussian' ? 'section' : 'gaussian');
  };

  return (
    <div className={styles.viewerContainer}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h2>공연장 3D 뷰어</h2>
          <p className={styles.instructions}>
            {isEgocentric 
              ? '2D 맵에서 다른 구역을 선택하여 시야를 확인할 수 있습니다'
              : '마우스로 드래그하여 시점을 변경하고, 스크롤하여 확대/축소할 수 있습니다'}
          </p>
        </div>
        <div className={styles.controls}>
          <button 
            className={`${styles.viewButton} ${isEgocentric ? styles.active : ''}`}
            onClick={handleViewButtonClick}
          >
            {isEgocentric ? '전체 뷰' : '1인칭 시점'}
          </button>
          <button 
            className={`${styles.viewButton} ${viewMode === 'section' ? styles.active : ''}`}
            onClick={handleToggleViewMode}
          >
            {viewMode === 'gaussian' ? '구역 뷰' : '실사 뷰'}
          </button>
          <button className={styles.closeButton} onClick={handleClose}>
            ✕
          </button>
        </div>
      </div>

      <div className={styles.viewerContent}>
        <div className={styles.canvasContainer}>
          {viewMode === 'gaussian' && (
            <>
              <div id="progress" style={{
                position: 'absolute',
                top: 0,
                height: '5px',
                background: 'var(--primary-color)',
                zIndex: 99,
                transition: 'width 0.1s ease-in-out',
                width: '0%'
              }}></div>
              
              <div id="message" style={{
                position: 'absolute',
                display: 'flex',
                top: 0,
                right: 0,
                left: 0,
                bottom: 0,
                zIndex: 2,
                height: '100%',
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: 'large',
                color: 'var(--error-color)',
                pointerEvents: 'none'
              }}></div>

              <div className="scene" id="spinner" style={{
                position: 'absolute',
                display: 'flex',
                top: 0,
                right: 0,
                left: 0,
                bottom: 0,
                zIndex: 2,
                height: '100%',
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div className="cube-wrapper">
                  <div className="cube">
                    <div className="cube-faces">
                      <div className="cube-face bottom"></div>
                      <div className="cube-face top"></div>
                      <div className="cube-face left"></div>
                      <div className="cube-face right"></div>
                      <div className="cube-face back"></div>
                      <div className="cube-face front"></div>
                    </div>
                  </div>
                </div>
              </div>

              <canvas 
                ref={canvasRef}
                id="canvas" 
                style={{ 
                  width: '100%', 
                  height: '100%',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  touchAction: 'none',
                  borderRadius: '10px'
                }}
              />

              <div style={{
                position: 'absolute',
                bottom: '10px',
                right: '10px',
                zIndex: 999,
                color: 'white',
                background: 'rgba(0,0,0,0.5)',
                padding: '5px 10px',
                borderRadius: '15px',
                fontSize: '14px'
              }}>
                <span id="fps"></span>
              </div>

              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                zIndex: 999,
                color: 'white',
                background: 'rgba(0,0,0,0.5)',
                padding: '5px 10px',
                borderRadius: '15px',
                fontSize: '14px'
              }}>
                <span id="camid"></span>
              </div>
            </>
          )}
        </div>

        <div className={styles.seatMap}>
          <div className={styles.mapContainer}>
            <div className={styles.firstFloorSections}>
              <div className={styles.sectionWrapper}>
                <button
                  className={`${styles.mapSection} ${styles.leftSection} ${selectedSection === '1F-LEFT' ? styles.active : ''}`}
                  onClick={() => handleSectionSelect('1F-LEFT')}
                >
                  1층 좌측 구역
                </button>
                <button
                  className={`${styles.wishButton} ${selectedSections.includes('1F-LEFT') ? styles.selected : ''}`}
                  onClick={() => handleToggleSection('1F-LEFT')}
                >
                  ���
                </button>
              </div>
              <div className={styles.sectionWrapper}>
                <button
                  className={`${styles.mapSection} ${styles.rightSection} ${selectedSection === '1F-RIGHT' ? styles.active : ''}`}
                  onClick={() => handleSectionSelect('1F-RIGHT')}
                >
                  1층 우측 구역
                </button>
                <button
                  className={`${styles.wishButton} ${selectedSections.includes('1F-RIGHT') ? styles.selected : ''}`}
                  onClick={() => handleToggleSection('1F-RIGHT')}
                >
                  ♥
                </button>
              </div>
            </div>

            <div className={styles.floorSections}>
              {['FLOOR-A', 'FLOOR-B', 'FLOOR-C'].map((sectionId) => (
                <div key={sectionId} className={styles.sectionWrapper}>
                  <button
                    className={`${styles.mapSection} ${selectedSection === sectionId ? styles.active : ''}`}
                    onClick={() => handleSectionSelect(sectionId)}
                  >
                    FLOOR {sectionId.split('-')[1]}구역
                  </button>
                  <button
                    className={`${styles.wishButton} ${selectedSections.includes(sectionId) ? styles.selected : ''}`}
                    onClick={() => handleToggleSection(sectionId)}
                  >
                    ♥
                  </button>
                </div>
              ))}
            </div>

            <div className={styles.stage}>
              STAGE
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .cube-wrapper {
          transform-style: preserve-3d;
        }
        .cube {
          transform-style: preserve-3d;
          transform: rotateX(45deg) rotateZ(45deg);
          animation: rotation 2s infinite;
        }
        .cube-faces {
          transform-style: preserve-3d;
          height: 80px;
          width: 80px;
          position: relative;
          transform-origin: 0 0;
          transform: translateX(0) translateY(0) translateZ(-40px);
        }
        .cube-face {
          position: absolute;
          inset: 0;
          background: var(--primary-color);
          border: solid 1px #ffffff;
        }
        .cube-face.top {
          transform: translateZ(80px);
        }
        .cube-face.front {
          transform-origin: 0 50%;
          transform: rotateY(-90deg);
        }
        .cube-face.back {
          transform-origin: 0 50%;
          transform: rotateY(-90deg) translateZ(-80px);
        }
        .cube-face.right {
          transform-origin: 50% 0;
          transform: rotateX(-90deg) translateY(-80px);
        }
        .cube-face.left {
          transform-origin: 50% 0;
          transform: rotateX(-90deg) translateY(-80px) translateZ(80px);
        }
        @keyframes rotation {
          0% {
            transform: rotateX(45deg) rotateY(0) rotateZ(45deg);
            animation-timing-function: cubic-bezier(0.17, 0.84, 0.44, 1);
          }
          50% {
            transform: rotateX(45deg) rotateY(0) rotateZ(225deg);
            animation-timing-function: cubic-bezier(0.76, 0.05, 0.86, 0.06);
          }
          100% {
            transform: rotateX(45deg) rotateY(0) rotateZ(405deg);
            animation-timing-function: cubic-bezier(0.17, 0.84, 0.44, 1);
          }
        }
      `}</style>
    </div>
  );
};

export default GaussianSplatting; 