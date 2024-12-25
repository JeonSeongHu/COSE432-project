import React, { useState, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment, 
  Html
} from '@react-three/drei';
import { 
  EffectComposer,
  Bloom,
  ChromaticAberration
} from '@react-three/postprocessing';
import * as THREE from 'three';
import styles from './VenueViewer.module.css';

interface VenueViewerProps {
  selectedSection?: string;
  onClose: () => void;
  onSectionSelect?: (sectionId: string) => void;
  selectedSections: string[];
  onToggleSection: (sectionId: string) => void;
}

interface SectionData {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  size: [number, number, number];
  name: string;
  viewPosition: [number, number, number];
  viewTarget: [number, number, number];
}

const SECTIONS_DATA: SectionData[] = [
  {
    id: 'FLOOR-A',
    position: [-3, 0, 2],
    rotation: [0, 0, 0],
    size: [2, 0.1, 2],
    name: 'FLOOR A구역',
    viewPosition: [-3, 1.6, 4],
    viewTarget: [0, 1, -2]
  },
  {
    id: 'FLOOR-B',
    position: [0, 0, 2],
    rotation: [0, 0, 0],
    size: [2, 0.1, 2],
    name: 'FLOOR B구역',
    viewPosition: [0, 1.6, 4],
    viewTarget: [0, 1, -2]
  },
  {
    id: 'FLOOR-C',
    position: [3, 0, 2],
    rotation: [0, 0, 0],
    size: [2, 0.1, 2],
    name: 'FLOOR C구역',
    viewPosition: [3, 1.6, 4],
    viewTarget: [0, 1, -2]
  },
  {
    id: '1F-LEFT',
    position: [-4, 2, 2],
    rotation: [0, 0, Math.PI * 0.1],
    size: [4, 1, 3],
    name: '1층 좌측 구역',
    viewPosition: [-4, 3, 4],
    viewTarget: [0, 1, -2]
  },
  {
    id: '1F-RIGHT',
    position: [4, 2, 2],
    rotation: [0, 0, -Math.PI * 0.1],
    size: [4, 1, 3],
    name: '1층 우측 구역',
    viewPosition: [4, 3, 4],
    viewTarget: [0, 1, -2]
  }
];

const Stage = () => {
  const stageWidth = 15;
  const stageDepth = 8;
  const stageHeight = 1;
  const screenWidth = stageWidth * 0.8;
  const screenHeight = 3;
  const stageFloorHeight = 0.5;

  return (
    <group position={[0, -0.5, -2]}>
      {/* 무대 바닥 */}
      <mesh receiveShadow>
        <boxGeometry args={[stageWidth, stageHeight, stageDepth]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* 무대 플랫폼 */}
      <mesh position={[0, stageHeight/2 + stageFloorHeight/2, -stageDepth/4]}>
        <boxGeometry args={[stageWidth * 0.6, stageFloorHeight, stageDepth * 0.5]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      
      {/* LED 스크린 - 중앙 */}
      <mesh position={[0, stageHeight + screenHeight/2, -stageDepth/2 + 0.1]}>
        <planeGeometry args={[screenWidth, screenHeight]} />
        <meshStandardMaterial color="#000033" emissive="#000066" emissiveIntensity={2} />
      </mesh>

      {/* LED 스크린 - 좌측 */}
      <mesh position={[-screenWidth/2, stageHeight + screenHeight/2, -stageDepth/2 + screenWidth/4]} rotation={[0, Math.PI/4, 0]}>
        <planeGeometry args={[screenWidth/2, screenHeight]} />
        <meshStandardMaterial color="#000033" emissive="#000066" emissiveIntensity={2} />
      </mesh>

      {/* LED 스크린 - 우측 */}
      <mesh position={[screenWidth/2, stageHeight + screenHeight/2, -stageDepth/2 + screenWidth/4]} rotation={[0, -Math.PI/4, 0]}>
        <planeGeometry args={[screenWidth/2, screenHeight]} />
        <meshStandardMaterial color="#000033" emissive="#000066" emissiveIntensity={2} />
      </mesh>

      {/* 무대 조명 */}
      <spotLight
        position={[-3, 6, -2]}
        angle={0.3}
        penumbra={0.5}
        intensity={2}
        color="#4444ff"
      />
      <spotLight
        position={[3, 6, -2]}
        angle={0.3}
        penumbra={0.5}
        intensity={2}
        color="#4444ff"
      />
    </group>
  );
};

const Section: React.FC<{
  data: SectionData;
  isSelected: boolean;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  onClick: (id: string) => void;
  isEgocentric: boolean;
  isWishSelected: boolean;
}> = ({ data, isSelected, isHovered, onHover, onClick, isEgocentric, isWishSelected }) => {
  const color = isWishSelected ? '#ffd700' : (isHovered ? '#aaaaff' : '#666666');
  const opacity = isSelected && isEgocentric ? 0.05 : (isHovered ? 0.8 : 0.6);

  return (
    <group
      position={new THREE.Vector3(...data.position)}
      rotation={new THREE.Euler(...data.rotation)}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(data.id);
      }}
      onPointerOut={() => onHover(null)}
      onClick={(e) => {
        e.stopPropagation();
        onClick(data.id);
      }}
    >
      <mesh>
        <boxGeometry args={data.size} />
        <meshStandardMaterial 
          color={color}
          transparent
          opacity={opacity}
        />
      </mesh>
      <Html
        position={[0, data.size[1] / 2 + 0.5, 0]}
        center
        style={{
          background: 'rgba(0,0,0,0.8)',
          padding: '5px 10px',
          borderRadius: '4px',
          color: isWishSelected ? '#ffd700' : 'white',
          transform: 'scale(0.5)',
          pointerEvents: 'none',
          opacity: isSelected && isEgocentric ? 0 : 1
        }}
      >
        {data.name}
      </Html>
    </group>
  );
};

const VenueScene: React.FC<{
  selectedSection?: string;
  onSectionSelect?: (sectionId: string) => void;
  isEgocentric: boolean;
  selectedSections: string[];
}> = ({ selectedSection, onSectionSelect, isEgocentric, selectedSections }) => {
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const { camera } = useThree();
  
  useEffect(() => {
    if (isEgocentric && selectedSection) {
      const section = SECTIONS_DATA.find(s => s.id === selectedSection);
      if (section) {
        camera.position.set(...section.viewPosition);
        camera.lookAt(...section.viewTarget);
      }
    }
  }, [isEgocentric, selectedSection, camera]);

  return (
    <>
      <Stage />
      <Environment preset="night" />
      
      {SECTIONS_DATA.map((section) => (
        <Section
          key={section.id}
          data={section}
          isSelected={selectedSection === section.id}
          isHovered={hoveredSection === section.id}
          onHover={setHoveredSection}
          onClick={(id) => onSectionSelect?.(id)}
          isEgocentric={isEgocentric}
          isWishSelected={selectedSections.includes(section.id)}
        />
      ))}

      <EffectComposer>
        <Bloom
          intensity={0.5}
          luminanceThreshold={0.1}
          luminanceSmoothing={0.9}
        />
        <ChromaticAberration 
          offset={new THREE.Vector2(0.002, 0.002)}
          radialModulation={false}
          modulationOffset={0.5}
        />
      </EffectComposer>
    </>
  );
};

const SeatMap: React.FC<{
  selectedSection?: string;
  onSectionSelect?: (sectionId: string) => void;
  selectedSections: string[];
  onToggleSection: (sectionId: string) => void;
}> = ({ selectedSection, onSectionSelect, selectedSections, onToggleSection }) => {
  const renderSectionButton = (sectionId: string, name: string, extraClassName?: string) => (
    <div 
      className={styles.sectionWrapper}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className={`${styles.mapSection} ${extraClassName || ''} ${selectedSection === sectionId ? styles.active : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          onSectionSelect?.(sectionId);
        }}
      >
        {name}
      </button>
      <button
        className={`${styles.wishButton} ${selectedSections.includes(sectionId) ? styles.selected : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          onToggleSection(sectionId);
        }}
      >
        ♥
      </button>
    </div>
  );

  return (
    <div className={styles.seatMap}>
      <div className={styles.mapContainer}>
        {/* 1층 좌우 구역 */}
        <div className={styles.firstFloorSections}>
          {renderSectionButton('1F-LEFT', '1층 좌측 구역', styles.leftSection)}
          {renderSectionButton('1F-RIGHT', '1층 우측 구역', styles.rightSection)}
        </div>

        {/* FLOOR 구역 */}
        <div className={styles.floorSections}>
          {['FLOOR-A', 'FLOOR-B', 'FLOOR-C'].map((sectionId) => 
            renderSectionButton(sectionId, `FLOOR ${sectionId.split('-')[1]}구역`)
          )}
        </div>

        {/* 무대 표시 */}
        <div className={styles.stage}>
          STAGE
        </div>
      </div>
    </div>
  );
};

const VenueViewer: React.FC<VenueViewerProps> = ({ 
  selectedSection, 
  onClose,
  onSectionSelect,
  selectedSections,
  onToggleSection
}) => {
  const [isEgocentric, setIsEgocentric] = useState(false);

  const handleSectionSelect = (sectionId: string) => {
    onSectionSelect?.(sectionId);
    setIsEgocentric(true);
  };

  const handleToggleSection = (sectionId: string) => {
    onToggleSection(sectionId);
  };

  const handleViewButtonClick = () => {
    if (isEgocentric && !selectedSection) {
      setIsEgocentric(false);
    } else {
      setIsEgocentric(!isEgocentric);
    }
  };

  return (
    <div className={styles.viewerContainer}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h2>상세 시야 확인</h2>
          <p className={styles.instructions}>
            {isEgocentric ? (
              '2D 맵에서 다른 구역을 선택하여 시야를 확인할 수 있습니다'
            ) : (
              '마우스 드래그하여 시점을 변경하고, 스크롤하여 확대/축소할 수 있습니다'
            )}
          </p>
        </div>
        <div className={styles.controls}>
          <button 
            className={`${styles.viewButton} ${isEgocentric ? styles.active : ''}`}
            onClick={handleViewButtonClick}
          >
            {isEgocentric ? '전체 뷰' : '1인칭 시점'}
          </button>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>
      </div>

      <div className={styles.viewerContent}>
        <div className={styles.canvasContainer}>
          <Canvas shadows>
            <PerspectiveCamera
              makeDefault
              position={isEgocentric ? [0, 1.6, 8] : [0, 10, 15]}
              fov={50}
            />
            {!isEgocentric && (
              <OrbitControls
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                maxPolarAngle={Math.PI / 2}
                target={[0, 0, 0]}
              />
            )}
            <fog attach="fog" args={['#000', 10, 50]} />
            <ambientLight intensity={0.5} />
            
            <VenueScene
              selectedSection={selectedSection}
              onSectionSelect={handleSectionSelect}
              isEgocentric={isEgocentric}
              selectedSections={selectedSections}
            />
          </Canvas>
        </div>

        <SeatMap 
          selectedSection={selectedSection}
          onSectionSelect={handleSectionSelect}
          selectedSections={selectedSections}
          onToggleSection={handleToggleSection}
        />
      </div>
    </div>
  );
};

export default VenueViewer; 