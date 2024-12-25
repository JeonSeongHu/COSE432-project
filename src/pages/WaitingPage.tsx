import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import { motion, AnimatePresence } from 'framer-motion';
import type { RootState } from '../store/store';
import type { Seat } from '../types/booking';
import { updateSeatStatus, setSelectedSeats } from '../store/bookingSlice';
import styles from './WaitingPage.module.css';

const MESSAGES = [
  { text: '예매 시작까지', subText: '대기 인원 {count}명' },
  { text: '대기가 끝나는 대로,', subText: '예매되지 않은 선호 좌석을 자동 예매 시도합니다' },
  { text: '선택한 모든 좌석이 모두 선점되어,', subText: '대기 종료 후 수동 예매를 시작합니다' }
];

// 메모이제이션된 선택자 수정 - 모든 선택된 좌석을 가져오도록 변경
const selectSelectedSeats = createSelector(
  [(state: RootState) => state.booking.selectedSeats],
  (selectedSeats) => selectedSeats // 필터링 제거
);

const WaitingPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [waitingCount, setWaitingCount] = useState(12340);
  const [timeLeft, setTimeLeft] = useState(10);
  const selectedSeats = useSelector(selectSelectedSeats);
  const [allSeatsTaken, setAllSeatsTaken] = useState(false);
  const [showWaitingCount, setShowWaitingCount] = useState(true);

  // 메시지 인덱스 관리 위한 메모이제이션 수정
  const messageIndex = useMemo(() => {
    const takenSeats = selectedSeats.filter(seat => seat.status === 'taken');
    if (takenSeats.length === selectedSeats.length && selectedSeats.length > 0) return 2;
    if (takenSeats.length > 0) return 1;
    return 0;
  }, [selectedSeats]);

  // 좌석 선점 체크
  useEffect(() => {
    const seatCheckInterval = setInterval(() => {
      selectedSeats.forEach((seat) => {
        if (seat.status !== 'taken' && Math.random() < 0.05) {
          dispatch(updateSeatStatus({ 
            seatId: seat.id, 
            status: 'taken' 
          }));
        }
      });
      
      // 모든 좌석이 선점되었는지 확인
      const allTaken = selectedSeats.every(seat => seat.status === 'taken');
      if (allTaken) {
        setAllSeatsTaken(true);
      }
    }, 1000);

    return () => clearInterval(seatCheckInterval);
  }, [dispatch, selectedSeats]);

  // 메시지 변경 직 수정
  useEffect(() => {
    setCurrentMessageIndex(messageIndex);
  }, [messageIndex, selectedSeats]);

  // 대기 인원 랜덤 감소
  useEffect(() => {
    const countInterval = setInterval(() => {
      setWaitingCount((prev) => {
        const decrease = Math.floor(Math.random() * 3 *(prev/ timeLeft)) + 10;
        return Math.max(0, prev - decrease);
      });
    }, 1500);

    return () => clearInterval(countInterval);
  }, []);

  // 카운트다운 타이머
  useEffect(() => {
    if (timeLeft <= 0) {
      const availableSeats = selectedSeats.filter(seat => seat.status !== 'taken');
      if (availableSeats.length > 0) {
        // 예매 가능한 좌석만 예매 내역에 추가
        dispatch(setSelectedSeats(availableSeats));
        navigate('/booking/success');
      } else {
        navigate('/booking/manual/seat');
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, navigate, selectedSeats]);

  // 메시지 토글 효과
  useEffect(() => {
    const toggleInterval = setInterval(() => {
      setShowWaitingCount(prev => !prev);
    }, 3000); // 3초마다 토글

    return () => clearInterval(toggleInterval);
  }, []);

  // 현재 표시할 메시지 결정
  const currentMessage = useMemo(() => {
    if (showWaitingCount) {
      const baseText = MESSAGES[0].subText.split('{count}');
      return {
        text: MESSAGES[0].text,
        subText: (
          <>
            {baseText[0]}
            <span className={styles.highlightCount}>{waitingCount}</span>
            {baseText[1]}
          </>
        )
      };
    }
    
    const takenSeats = selectedSeats.filter(seat => seat.status === 'taken');
    if (takenSeats.length === selectedSeats.length && selectedSeats.length > 0) {
      return MESSAGES[2];
    }
    return MESSAGES[1];
  }, [showWaitingCount, waitingCount, selectedSeats]);

  const formatSeatName = (seat: Seat) => {
    return `${seat.section} ${seat.row}열 ${seat.number}번`;
  };

  return (
    <div className={styles.container}>
      <motion.div 
        className={styles.infoBox}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.p 
          className={styles.waitingCount}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          예매 대기중
        </motion.p>
        <motion.div 
          className={styles.waitingTimeWrapper}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className={styles.timeBox}>
            <span className={styles.waitingTime}>예상 대기 시간</span>
            <motion.span 
              className={styles.timeLeft}
              key={timeLeft}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {timeLeft}초
            </motion.span>
          </div>
        </motion.div>
      </motion.div>

      <div className={styles.messageBox}>
        <AnimatePresence mode="wait">
          <motion.div 
            className={`${styles.messageWrapper} fadeInUp`}
            key={showWaitingCount ? 'waiting' : 'status'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <motion.h1 
              className={styles.mainText}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {currentMessage.text}
            </motion.h1>
            <motion.p 
              className={styles.subText}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {currentMessage.subText}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      <motion.div 
        className={styles.selectedSeats}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className={styles.seatList}>
          {selectedSeats.map((seat, index) => (
            <motion.div 
              key={seat.id} 
              className={`${styles.seatItem} ${seat.status === 'taken' ? styles.takenSeat : ''} transition-all`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              {formatSeatName(seat)}
              {seat.status === 'taken'}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default WaitingPage; 