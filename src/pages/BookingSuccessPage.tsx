import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { createSelector } from '@reduxjs/toolkit';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import styles from './BookingSuccessPage.module.css';
import { useNavigate } from 'react-router-dom';

const selectAvailableSeats = createSelector(
  [(state: RootState) => state.booking.selectedSeats],
  (selectedSeats) => selectedSeats.filter(seat => seat.status !== 'taken')
);

const BookingSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const selectedSeats = useSelector(selectAvailableSeats);

  const getSeatSummary = () => {
    if (selectedSeats.length === 0) return '';
    const seat = selectedSeats[0];
    return `${seat.section} ${seat.row}열 ${seat.number}번`;
  };

  useEffect(() => {
    // 컨페티 애니메이션 실행
    const duration = 0.5 * 1000;
    const end = Date.now() + duration;

    const runAnimation = () => {
      const opts = {
        particleCount: 5,
        startVelocity: 30,
        spread: 360,
        origin: { x: Math.random(), y: Math.random() * 0.5 },
        colors: ['#FF0000', '#FFA500', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#8F00FF'],
      };

      confetti(opts);

      if (Date.now() < end) {
        requestAnimationFrame(runAnimation);
      }
    };

    runAnimation();
  }, []);

  return (
    <div className={styles.container}>
      <motion.div 
        className={`${styles.successBox} fadeIn`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className={`${styles.partyIcon} bounce`}
          animate={{ 
            y: [0, -20, 0],
          }}
          transition={{ 
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          🎉
        </motion.div>
        <motion.h1 
          className={styles.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          예매 성공!
        </motion.h1>
        <motion.p 
          className={styles.subtitle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {getSeatSummary()} 좌석이 성공적으로 예매되었습니다
        </motion.p>
        
        <motion.button 
          className={`${styles.confirmButton} transition-all`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate('/history')}
        >
          예매 내역 확인하기
        </motion.button>
      </motion.div>
    </div>
  );
};

export default BookingSuccessPage; 