import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedSeats, setCurrentSection, setSelectedSections, setSectionSeats } from '../../store/bookingSlice';
import type { RootState } from '../../store/store';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../components/common/Button/Button';
import PageTransition from '../../components/layout/PageTransition';
import styles from './BookingPage.module.css';
import { fetchSectionSeats } from '../../services/seatService';
import { Seat } from '../../types/booking';

interface SectionInfo {
  id: string;
  name: string;
  isAvailable: boolean;
}

const BookingSeatPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { selectedSections, selectedSeats, currentSection, sectionSeats } = useSelector(
    (state: RootState) => state.booking
  );

  const sections = selectedSections.length > 0 
    ? selectedSections 
    : location.state?.selectedSections || ['FLOOR-A'];

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (location.state?.selectedSections) {
      dispatch(setSelectedSections(location.state.selectedSections));
    }
    if (!currentSection && sections.length > 0) {
      dispatch(setCurrentSection(sections[0]));
    }
  }, [dispatch, location.state, sections, currentSection]);

  useEffect(() => {
    const loadSectionSeats = async () => {
      if (currentSection && !sectionSeats[currentSection]) {
        setIsLoading(true);
        try {
          const seats = await fetchSectionSeats(currentSection);
          dispatch(setSectionSeats({ sectionId: currentSection, seats }));
        } catch (error) {
          console.error('Failed to load section seats:', error);
          // TODO: 에러 처리
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadSectionSeats();
  }, [currentSection, dispatch, sectionSeats]);

  const [showOverview, setShowOverview] = useState(false);

  const handleSeatClick = (seatId: string) => {
    const newSeats = selectedSeats.find(seat => seat.id === seatId)
      ? selectedSeats.filter(seat => seat.id !== seatId)
      : selectedSeats.length < 3
      ? [...selectedSeats, {
          id: seatId,
          section: currentSection,
          row: String(Math.floor(Number(seatId.split('-')[2]) / 16) + 1),
          number: String((Number(seatId.split('-')[2]) % 16) + 1),
          status: 'selected' as const
        }]
      : selectedSeats;

    if (!selectedSeats.find(seat => seat.id === seatId) && selectedSeats.length >= 3) {
      alert('최대 3개의 좌석까지만 선택할 수 있습니다.');
      return;
    }

    dispatch(setSelectedSeats(newSeats));
  };

  const handleSectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setCurrentSection(e.target.value));
  };

  const getSeatLabel = (seatId: string) => {
    const row = Math.floor(Number(seatId.split('-')[2]) / 16) + 1;
    const col = (Number(seatId.split('-')[2]) % 16) + 1;
    return `${row}열 ${col}번`;
  };

  return (
    <PageTransition>
      <motion.div 
        className={styles.container}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="fadeInDown"
          >
            관람 희망 좌석을<br />3개까지 선택해주세요
          </motion.h2>
          <motion.button 
            className={`${styles.overviewButton} transition-all`}
            onClick={() => setShowOverview(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {selectedSeats.length}/3
          </motion.button>
        </motion.div>

        <motion.p 
          className={`${styles.subText} fadeInUp`}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          예매를 시도하면 선택한 좌석 순서대로<br />
          자동으로 시도해드려요
        </motion.p>

        <motion.select 
          value={currentSection} 
          onChange={handleSectionChange}
          className={`${styles.sectionSelect} transition-all`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          whileFocus={{ scale: 1.02 }}
        >
          {sections.map((section: string) => (
            <option key={section} value={section}>
              {section === 'FLOOR-A' ? 'FLOOR A' : 
               section === 'FLOOR-B' ? 'FLOOR B' : 
               section === 'FLOOR-C' ? 'FLOOR C' :
               section === '1F-LEFT' ? '1층 좌측 구역' :
               section === '1F-RIGHT' ? '1층 우측 구역' : section}
            </option>
          ))}
        </motion.select>

        <motion.div 
          className={`${styles.stage} fadeIn`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          STAGE
        </motion.div>

        <motion.div
          className={styles.seatGrid}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            delay: 0.1,
            type: "spring",
            stiffness: 100
          }}
        >
          {isLoading ? (
            <motion.div 
              className={`${styles.loading} fadeIn`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              로딩 중...
            </motion.div>
          ) : (
            currentSection && sectionSeats[currentSection]?.map((seat, index) => (
              <motion.button
                key={seat.id}
                className={`${styles.seat} ${
                  selectedSeats.find(s => s.id === seat.id) ? styles.selected : ''
                } ${seat.status === 'taken' ? styles.taken : ''} transition-all`}
                onClick={() => handleSeatClick(seat.id)}
                disabled={seat.status === 'taken' || (selectedSeats.length >= 3 && !selectedSeats.find(s => s.id === seat.id))}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.01 }}
                whileHover={seat.status !== 'taken' ? { scale: 1.2 } : {}}
              />
            ))
          )}
        </motion.div>

        <AnimatePresence>
          {showOverview && (
            <motion.div
              className={`${styles.overview} scaleIn`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div 
                className={styles.overviewHeader}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  선택한 좌석
                </motion.h3>
                <motion.button 
                  onClick={() => setShowOverview(false)}
                  className="transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  닫기
                </motion.button>
              </motion.div>
              <motion.ul 
                className={styles.selectedSeatsList}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {selectedSeats.map((seat, index) => (
                  <motion.li 
                    key={seat.id}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * (index + 1) }}
                  >
                    {index + 1}. {seat.section} {getSeatLabel(seat.id)}
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="fadeInUp"
        >
          <motion.div
            whileHover={selectedSeats.length > 0 ? { scale: 1.02 } : {}}
            transition={{ duration: 0.2 }}
          >
            <Button
              BoldText="정보 입력하러 가기"
              type={selectedSeats.length > 0 ? 'primary' : 'disabled'}
              onClick={() => navigate('/booking/info')}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </PageTransition>
  );
}

export default BookingSeatPage; 