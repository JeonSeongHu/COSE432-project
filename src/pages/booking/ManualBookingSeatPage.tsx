import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../../components/common/Button/Button';
import styles from './BookingPage.module.css';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedSeats, setCurrentSection, setSectionSeats, resetBooking } from '../../store/bookingSlice';
import { setBackHandler } from '../../store/headerSlice';
import type { RootState } from '../../store/store';
import PageTransition from '../../components/layout/PageTransition';
import { motion } from 'framer-motion';
import { fetchSectionSeats, fetchAvailableSections } from '../../services/seatService';
import { Seat } from '../../types/booking';

interface ExitConfirmPopupProps {
  onCancel: () => void;
  onConfirm: () => void;
}

const ExitConfirmPopup: React.FC<ExitConfirmPopupProps> = ({ onCancel, onConfirm }) => {
  return (
    <div className={styles.exitConfirmPopup}>
      <div className={styles.exitConfirmContent}>
        
        <h3>😢<br/ > 예매에<br />실패하셨나요?</h3>
        <p>아직 포기하지 마세요!<br />취소석이 발생할 시,<br />알람을 보내드립니다.</p>
        <div className={styles.exitConfirmButtons}>
          <button onClick={onConfirm}>알람 설정하고 계속하기</button>
          <button onClick={onCancel}>그만 예매하기</button>
        </div>
      </div>
    </div>
  );
};

const BookingSeatPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { selectedSeats, currentSection, sectionSeats } = useSelector(
    (state: RootState) => state.booking
  );

  const [isLoading, setIsLoading] = useState(true);
  const [availableSections, setAvailableSections] = useState<string[]>([]);
  const [showOverview, setShowOverview] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const isPrepaid = useSelector((state: RootState) => state.booking.isPrepaid);

  // 컴포넌트 마운트 시 선택 상태 초기화
  useEffect(() => {
    dispatch(resetBooking());
  }, [dispatch]);

  // Header의 뒤로가기 핸들러 설정
  useEffect(() => {
    const handleBack = () => {
      setShowExitConfirm(true);
    };

    dispatch(setBackHandler(handleBack));

    // 컴포넌트 언마운트 시 핸들러 제거
    return () => {
      dispatch(setBackHandler(null));
    };
  }, [dispatch]);

  // 모든 섹션 정보 로드
  useEffect(() => {
    const loadSections = async () => {
      try {
        const sections = await fetchAvailableSections();
        setAvailableSections(sections);
        if (sections.length > 0 && !currentSection) {
          dispatch(setCurrentSection(sections[0]));
        }
      } catch (error) {
        console.error('Failed to load available sections:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSections();
  }, [dispatch, currentSection]);

  // 현재 섹션의 좌석 정보 로드
  useEffect(() => {
    const loadSectionSeats = async () => {
      if (currentSection && !sectionSeats[currentSection]) {
        setIsLoading(true);
        try {
          const seats = await fetchSectionSeats(currentSection);
          dispatch(setSectionSeats({ sectionId: currentSection, seats }));
        } catch (error) {
          console.error('Failed to load section seats:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadSectionSeats();
  }, [currentSection, dispatch, sectionSeats]);

  // 시간이 지날수록 랜덤하게 좌석이 매진되는 효과
  useEffect(() => {
    const timer = setInterval(() => {
      if (currentSection && sectionSeats[currentSection]) {
        const seats = [...sectionSeats[currentSection]];
        const availableSeats = seats.filter(seat => seat.status === 'available');
        
        // 매 틱마다 1~3좌석 매진 처리
        const numSeatsToTake = Math.floor(Math.random() * 3) + 1;
        const shuffledSeats = availableSeats
          .map(value => ({ value, sort: Math.random() }))
          .sort((a, b) => a.sort - b.sort)
          .map(({ value }) => value);
        const seatsToTake = shuffledSeats.slice(0, numSeatsToTake);
        
        if (seatsToTake.length > 0) {
          dispatch(setSectionSeats({
            sectionId: currentSection,
            seats: seats.map(seat => {
              if (seatsToTake.find(s => s.id === seat.id)) {
                return { ...seat, status: 'taken' as const };
              }
              return seat;
            })
          }));

          // 새로 'taken'된 좌석이 selectedSeats에 있다면 선택 해제
          const takenSeatIds = seatsToTake.map(s => s.id);
          const updatedSelectedSeats = selectedSeats.filter(
            seat => !takenSeatIds.includes(seat.id)
          );
          if (updatedSelectedSeats.length !== selectedSeats.length) {
            dispatch(setSelectedSeats(updatedSelectedSeats));
          }
        }
      }
    }, 50);

    return () => clearInterval(timer);
  }, [currentSection, sectionSeats, dispatch, selectedSeats]);

  const handleSeatClick = (seatId: string) => {
    // 이미 선택된 좌석인 경우 선택 취소
    if (selectedSeats.find(seat => seat.id === seatId)) {
      dispatch(setSelectedSeats(selectedSeats.filter(seat => seat.id !== seatId)));
      return;
    }

    // 새로운 좌석 선택
    if (selectedSeats.length >= 3) {
      alert('최대 3개의 좌석까지만 선택할 수 있습니다.');
      return;
    }

    const newSeat = {
      id: seatId,
      section: currentSection,
      row: String(Math.floor(Number(seatId.split('-')[2]) / 16) + 1),
      number: String((Number(seatId.split('-')[2]) % 16) + 1),
      status: 'selected' as const
    };

    dispatch(setSelectedSeats([...selectedSeats, newSeat]));
  };

  const handleSectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setCurrentSection(e.target.value));
  };

  const getSeatLabel = (seatId: string) => {
    const row = Math.floor(Number(seatId.split('-')[2]) / 16) + 1;
    const col = (Number(seatId.split('-')[2]) % 16) + 1;
    return `${row}열 ${col}번`;
  };

  const handleNextClick = () => {
    if (selectedSeats.length === 0) {
      alert('좌석을 선택해주세요.');
      return;
    }

    if (isPrepaid) {
      // 사전 결제��� 완료된 경우 성공 페이지로 이동
      navigate('/booking/success', { 
        state: { 
          seats: selectedSeats,
          isPrepaid: true
        } 
      });
    } else {
      // 사전 결제가 안 된 경우 결제 페이지로 이동
      navigate('/booking/payment', { 
        state: { 
          seats: selectedSeats,
          returnTo: '/booking/success'
        } 
      });
    }
  };

  const handleExitCancel = () => {
    navigate("/");
  };

  const handleExitContinue = () => {
    setShowExitConfirm(false);
  };

  return (
    <PageTransition>
      <div className={styles.container}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2>관람 희망 좌석을<br />3개까지 선택해주세요</h2>
          <button 
            className={styles.overviewButton}
            onClick={() => setShowOverview(true)}
          >
            {selectedSeats.length}/3
          </button>
        </motion.div>

        <p className={styles.subText}>
          예매를 시도하면 선택한 좌석 순서대로<br />
          자동으로 시도해드려요
        </p>

        <select 
          value={currentSection} 
          onChange={handleSectionChange}
          className={styles.sectionSelect}
        >
          {availableSections.map((section: string) => (
            <option key={section} value={section}>
              {section === 'FLOOR-A' ? 'FLOOR A' : 
               section === 'FLOOR-B' ? 'FLOOR B' : 
               section === 'FLOOR-C' ? 'FLOOR C' :
               section === '1F-LEFT' ? '1층 좌측 구역' :
               section === '1F-RIGHT' ? '1층 우측 구역' : section}
            </option>
          ))}
        </select>

        <div className={styles.stage}>STAGE</div>

        <motion.div
          className={styles.seatGrid}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          {isLoading ? (
            <div className={styles.loading}>로딩 중...</div>
          ) : (
            currentSection && sectionSeats[currentSection]?.map((seat) => (
              <button
                key={seat.id}
                className={`${styles.seat} ${
                  selectedSeats.find(s => s.id === seat.id) ? styles.selected : ''
                } ${seat.status === 'taken' ? styles.taken : ''}`}
                onClick={() => handleSeatClick(seat.id)}
                disabled={seat.status === 'taken' || (selectedSeats.length >= 3 && !selectedSeats.find(s => s.id === seat.id))}
              />
            ))
          )}
        </motion.div>

        <div className={styles.seatLegend}>
          <div className={styles.legendItem}>
            <div className={`${styles.legendColor} ${styles.available}`}></div>
            <span>선택 가능</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendColor} ${styles.selected}`}></div>
            <span>선택 중</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendColor} ${styles.taken}`}></div>
            <span>선택 불가</span>
          </div>
        </div>

        {showOverview && (
          <motion.div
            className={styles.overview}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className={styles.overviewHeader}>
              <h3>선택한 좌석</h3>
              <button onClick={() => setShowOverview(false)}>닫기</button>
            </div>
            <ul className={styles.selectedSeatsList}>
              {selectedSeats.map((seat, index) => (
                <li key={seat.id}>
                  {index + 1}. {seat.section} {getSeatLabel(seat.id)}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        <Button
          BoldText={isPrepaid ? "예매 료하기" : "결제하기"}
          type={selectedSeats.length > 0 ? 'primary' : 'disabled'}
          onClick={handleNextClick}
        />

        {showExitConfirm && (
          <ExitConfirmPopup
            onCancel={handleExitCancel}
            onConfirm={handleExitContinue}
          />
        )}
      </div>
    </PageTransition>
  );
};

export default BookingSeatPage; 