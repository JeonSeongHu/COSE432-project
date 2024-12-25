import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import type { RootState } from '../store/store';
import type { Seat } from '../types/booking';
import { updateSeatStatus, setSelectedSeats } from '../store/bookingSlice';
import styles from './WaitingPage.module.css';

// 안내 메시지 상수
const MESSAGES = [
  { text: '예매 시작까지', subText: '대기 인원 {count}명' },
  { text: '대기가 끝나는 대로,', subText: '예매되지 않은 선호 좌석을 자동 예매 시도합니다' },
  { text: '선택한 모든 좌석이 모두 선점되어,', subText: '대기 종료 후 수동 예매를 시작합니다' }
];

const selectSelectedSeats = (state: RootState) => state.booking.selectedSeats;

const ALL_WAITING = 12340;

const WaitingPage: React.FC = () => {
  console.log('[Debug] WaitingPage Rendered');

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux 상태
  const selectedSeats = useSelector(selectSelectedSeats);

  // State
  const [timeLeft, setTimeLeft] = useState(10);      // 카운트다운 용
  const [waitingCount, setWaitingCount] = useState(ALL_WAITING); 
  const [allSeatsTaken, setAllSeatsTaken] = useState(false);
  const [showWaitingCount, setShowWaitingCount] = useState(true);
  const [hasBooked, setHasBooked] = useState(false);

  // -------------------------------------------------------
  // 1) timeLeft 카운트다운 (1초마다 감소)
  // -------------------------------------------------------
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // -------------------------------------------------------
  // 2) 대기 인원(waitingCount) 감소 (1.5초마다)
  //    - 여기서는 timeLeft가 바뀌어도 effect를 재등록하지 않도록 주의
  // -------------------------------------------------------
  useEffect(() => {
    console.log('[Debug] Registering setInterval for waitingCount...');
    const countInterval = setInterval(() => {
      console.log('[Debug] Inside setInterval callback for waitingCount');
      setWaitingCount((prevCount) => {
        if (prevCount <= 0) return 0;
        // 원하는 로직에 따라 감소폭 지정 (예: 아래는 "timeLeft"를 굳이 쓰지 않고 간단히 100씩 감소)
        // 기존 로직대로 하려면, timeLeft를 참조해야 하지만 의존성을 걸면 무한 재실행이므로 주의 필요.
        // 여기서는 예시로 일정량만 감소.
        const decrease = Math.floor(ALL_WAITING / 6);
        console.log('[Debug] waitingCount prev:', prevCount, ' / decrease:', decrease);
        return Math.max(0, prevCount - decrease);
      });
    }, 1500);

    // cleanup
    return () => {
      console.log('[Debug] Clearing setInterval for waitingCount');
      clearInterval(countInterval);
    };
    // 의존성: 빈 배열이므로, 최초 마운트 시 한 번만 등록
    // (timeLeft 등을 넣으면 매초 재실행 → 바로 interval 해제되는 문제)
  }, []);

  // -------------------------------------------------------
  // 3) timeLeft가 0 이하가 되면 waitingCount = 0
  // -------------------------------------------------------
  // useEffect(() => {
  //   if (timeLeft <= 0) {
  //     console.log('[Debug] timeLeft <= 0, set waitingCount = 0');
  //     setWaitingCount(0);
  //   }
  // }, []);

  // -------------------------------------------------------
  // 4) 좌석 선점 체크
  // -------------------------------------------------------
  useEffect(() => {
    if (allSeatsTaken || timeLeft <= 0) return;

    const seatCheckInterval = setInterval(() => {
      let updated = false;
      selectedSeats.forEach((seat) => {
        // 랜덤으로 5% 확률로 선점
        if (seat.status !== 'taken' && Math.random() < 0.05) {
          updated = true;
          dispatch(updateSeatStatus({ seatId: seat.id, status: 'taken' }));
        }
      });
      // 전부 선점되었는지 확인
      if (updated) {
        const allTaken = selectedSeats.every((seat) => seat.status === 'taken');
        if (allTaken) {
          setAllSeatsTaken(true);
        }
      }
    }, 1000);

    return () => clearInterval(seatCheckInterval);
  }, [allSeatsTaken, timeLeft, dispatch, selectedSeats]);

  // -------------------------------------------------------
  // 5) timeLeft가 0 이하 → 예매 완료 처리
  // -------------------------------------------------------
  useEffect(() => {
    if (timeLeft > 0 || hasBooked) return;

    console.log('[Debug] timeLeft == 0 -> Booking logic triggered');
    setHasBooked(true);

    const availableSeats = selectedSeats.filter((seat) => seat.status !== 'taken');
    if (availableSeats.length !== selectedSeats.length) {
      dispatch(setSelectedSeats(availableSeats));
    }

    if (availableSeats.length > 0) {
      navigate('/booking/success');
    } else {
      navigate('/booking/manual/seat');
    }
  }, [timeLeft, hasBooked, dispatch, navigate, selectedSeats]);

  // -------------------------------------------------------
  // 6) 3초마다 메시지 토글 (showWaitingCount 토글)
  // -------------------------------------------------------
  useEffect(() => {
    const toggleInterval = setInterval(() => {
      setShowWaitingCount((prev) => !prev);
    }, 3000);

    return () => clearInterval(toggleInterval);
  }, []);

  // -------------------------------------------------------
  // 7) messageIndex: 좌석 선점 상태에 따른 메시지 구분
  // -------------------------------------------------------
  const messageIndex = useMemo(() => {
    const takenSeats = selectedSeats.filter((seat) => seat.status === 'taken');
    if (takenSeats.length === selectedSeats.length && selectedSeats.length > 0) {
      return 2;
    }
    if (takenSeats.length > 0) {
      return 1;
    }
    return 0;
  }, [selectedSeats]);

  // -------------------------------------------------------
  // 8) 현재 표시할 메시지 (showWaitingCount === true면 대기인원, 아니면 선점 상황)
  // -------------------------------------------------------
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
        ),
      };
    }
    const takenSeats = selectedSeats.filter((seat) => seat.status === 'taken');
    if (takenSeats.length === selectedSeats.length && selectedSeats.length > 0) {
      return MESSAGES[2];
    }
    return MESSAGES[1];
  }, [showWaitingCount, waitingCount, selectedSeats]);

  // 좌석 표시용
  const formatSeatName = (seat: Seat) => {
    return `${seat.section} ${seat.row}열 ${seat.number}번`;
  };

  // -------------------------------------------------------
  // 최종 렌더링
  // -------------------------------------------------------
  return (
    <div className={styles.container}>
      {/* 상단: 대기중 / 남은시간 */}
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
              {timeLeft <= 0 ? 0 : timeLeft}초
            </motion.span>
          </div>
        </motion.div>
      </motion.div>

      {/* 메시지 박스 */}
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

      {/* 선택한 좌석들 */}
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
              className={`${styles.seatItem} ${
                seat.status === 'taken' ? styles.takenSeat : ''
              } transition-all`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              {formatSeatName(seat)}
              {seat.status === 'taken' && (
                <span className={styles.takenLabel}> (선점됨)</span>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default WaitingPage;
