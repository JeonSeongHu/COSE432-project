import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedSections } from '../../store/bookingSlice';
import type { RootState } from '../../store/store';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../components/common/Button/Button';
import Accordion from '../../components/common/Accordion/Accordion';
import PageTransition from '../../components/layout/PageTransition';
import styles from './BookingPage.module.css';
import { fetchAvailableSections } from '../../services/seatService';
import VenueViewer from '../../components/viewer/VenueViewer';

interface SectionInfo {
  id: string;
  name: string;
  isAvailable: boolean;
}

interface SectionGroup {
  title: string;
  items: SectionInfo[];
}

interface SectionGroups {
  floor: SectionGroup;
  firstFloor: SectionGroup;
  firstFloorRight: SectionGroup;
}

const BookingSectionPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const selectedSections = useSelector((state: RootState) => state.booking.selectedSections);

  const [isLoading, setIsLoading] = useState(true);
  const [availableSections, setAvailableSections] = useState<string[]>([]);
  const [showViewer, setShowViewer] = useState(false);
  const [viewerSection, setViewerSection] = useState<string | undefined>(undefined);

  useEffect(() => {
    const loadSections = async () => {
      try {
        const sections = await fetchAvailableSections();
        setAvailableSections(sections);
      } catch (error) {
        console.error('Failed to load available sections:', error);
        // TODO: 에러 처리
      } finally {
        setIsLoading(false);
      }
    };

    loadSections();
  }, []);

  const sections: SectionGroups = useMemo(() => ({
    floor: {
      title: 'FLOOR',
      items: availableSections
        .filter(id => id.startsWith('FLOOR-'))
        .map(id => ({ id, name: id, isAvailable: true }))
    },
    firstFloor: {
      title: '1층 좌측 구역',
      items: availableSections
        .filter(id => id === '1F-LEFT')
        .map(id => ({ id, name: '1층 좌측 구역', isAvailable: true }))
    },
    firstFloorRight: {
      title: '1층 우측 구역',
      items: availableSections
        .filter(id => id === '1F-RIGHT')
        .map(id => ({ id, name: '1층 우측 구역', isAvailable: true }))
    }
  }), [availableSections]);

  const getSelectedCount = (sectionIds: string[]) => {
    return sectionIds.filter(id => selectedSections.includes(id)).length;
  };

  const sectionTitles = useMemo(() => ({
    floor: `${sections.floor.title} (${getSelectedCount(sections.floor.items.map(item => item.id))}/${sections.floor.items.length})`,
    firstFloor: `${sections.firstFloor.title} (${getSelectedCount(sections.firstFloor.items.map(item => item.id))}/${sections.firstFloor.items.length})`,
    firstFloorRight: `${sections.firstFloorRight.title} (${getSelectedCount(sections.firstFloorRight.items.map(item => item.id))}/${sections.firstFloorRight.items.length})`
  }), [selectedSections, sections]);

  const handleSectionClick = (sectionId: string) => {
    const currentSections = [...selectedSections];
    const sectionIndex = currentSections.indexOf(sectionId);
    
    if (sectionIndex >= 0) {
      currentSections.splice(sectionIndex, 1);
    } else {
      currentSections.push(sectionId);
    }
    
    dispatch(setSelectedSections(currentSections));
  };

  const handleNextClick = () => {
    const returnTo = location.state?.returnTo;
    if (returnTo) {
      navigate(returnTo);
    } else {
      navigate('/booking/seat');
    }
  };

  const handleSelectAllClick = (sectionItems: SectionInfo[]) => {
    const allSelected = sectionItems.every((item: SectionInfo) => selectedSections.includes(item.id));
    
    if (allSelected) {
      dispatch(setSelectedSections(
        selectedSections.filter(id => !sectionItems.some((item: SectionInfo) => item.id === id))
      ));
    } else {
      const newSections = [...selectedSections];
      sectionItems.forEach((item: SectionInfo) => {
        if (!newSections.includes(item.id)) {
          newSections.push(item.id);
        }
      });
      dispatch(setSelectedSections(newSections));
    }
  };

  const handleViewClick = () => {
    setShowViewer(true);
  };

  const handleSectionSelect = (sectionId: string) => {
    setViewerSection(sectionId);
  };

  const handleGaussianSplattingClick = () => {
    navigate('/gaussian-splatting');
  };

  if (isLoading) {
    return (
      <PageTransition>
        <motion.div 
          className={styles.container}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className={`${styles.loading} fadeIn`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            로딩 중...
          </motion.div>
        </motion.div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <motion.div 
        className={styles.container}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="fadeInDown"
        >
          관람 희망 구역을<br />모두 선택해주세요.
        </motion.h2>

        <motion.p 
          className={`${styles.subText} fadeInUp`}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          희망 구역 내에 남은 자리가 생기면<br />
          자동으로 알림을 보내드려요
        </motion.p>

        <motion.button 
          className={`${styles.viewButton} transition-all`}
          onClick={handleViewClick}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          상세 시야 확인 👁️
        </motion.button>

        <motion.div 
          className={styles.sectionList}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <AnimatePresence>
            {Object.entries(sections).map(([key, section], index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 5 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className={`${section.items.every((item: SectionInfo) => selectedSections.includes(item.id)) ? styles.allSelected : ''} transition-all`}
              >
                <div className={styles.accordionHeader}>
                  <div className={styles.accordionWrapper}>
                    <Accordion 
                      title={sectionTitles[key as keyof typeof sectionTitles]} 
                      defaultOpen={key === 'floor'}
                    >
                      <motion.div 
                        className={styles.floorLayout}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        {section.items.map((item: SectionInfo, itemIndex: number) => (
                          <motion.div 
                            key={item.id} 
                            className={styles.sectionButtonWrapper}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 * itemIndex }}
                          >
                            <motion.button 
                              className={`${styles.section} ${selectedSections.includes(item.id) ? styles.selected : ''} transition-all`}
                              onClick={() => handleSectionClick(item.id)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {item.name}
                            </motion.button>
                          </motion.div>
                        ))}
                      </motion.div>
                    </Accordion>
                  </div>
                  <motion.button 
                    className={`${styles.selectAllButton} ${section.items.every((item: SectionInfo) => selectedSections.includes(item.id)) ? styles.active : ''} transition-all`}
                    onClick={() => handleSelectAllClick(section.items)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    전체 선택
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="fadeInUp"
        >
          <motion.div
            whileHover={selectedSections.length > 0 ? { scale: 1.02 } : {}}
            transition={{ duration: 0.2 }}
          >
            <Button
              BoldText={location.state?.returnTo ? "수정 완료" : "희망 좌석 선택하러 가기"}
              type={selectedSections.length > 0 ? 'primary' : 'disabled'}
              onClick={handleNextClick}
            />
          <motion.button
                className={`${styles.smallButton} transition-all`}
                onClick={handleGaussianSplattingClick}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                Gaussian Splatting
              </motion.button>
          </motion.div>
        </motion.div>

        <AnimatePresence>
          {showViewer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <VenueViewer
                selectedSection={viewerSection}
                onClose={() => setShowViewer(false)}
                onSectionSelect={handleSectionSelect}
                selectedSections={selectedSections}
                onToggleSection={handleSectionClick}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </PageTransition>
  );
};

export default BookingSectionPage; 