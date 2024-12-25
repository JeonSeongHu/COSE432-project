import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedDate } from '../../store/bookingSlice';
import type { RootState } from '../../store/store';
import { motion } from 'framer-motion';
import Calendar from '../../components/common/Calendar/Calendar';
import Button from '../../components/common/Button/Button';
import PageTransition from '../../components/layout/PageTransition';
import styles from './BookingPage.module.css';

const BookingCalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const selectedDate = useSelector((state: RootState) => state.booking.selectedDate);

  const availableDates = [
    {
      date: new Date(2024, 10, 14),
      time: "18:00 - 21:00 (180분)",
      capacity: "15,021",
      currentBooking: "45,500",
      competitionRate: "3.1 : 1"
    },
    {
      date: new Date(2024, 10, 15),
      time: "18:00 - 21:00 (180분)",
      capacity: "15,021",
      currentBooking: "45,500",
      competitionRate: "3.1 : 1"
    },
    {
      date: new Date(2024, 10, 16),
      time: "18:00 - 21:00 (180분)",
      capacity: "15,021",
      currentBooking: "45,500",
      competitionRate: "3.1 : 1"
    }
  ];

  const handleDateSelect = (dateInfo: any) => {
    const selectedDateInfo = availableDates.find(
      d => d.date.getDate() === dateInfo.date.getDate()
    );
    
    if (selectedDateInfo) {
      dispatch(setSelectedDate(selectedDateInfo.date.toISOString()));
    }
  };

  const currentDateInfo = selectedDate 
    ? availableDates.find(d => 
        d.date.getDate() === new Date(selectedDate).getDate()
      )
    : null;

  const handleNextClick = () => {
    const returnTo = location.state?.returnTo;
    if (returnTo) {
      navigate(returnTo);
    } else {
      navigate('/booking/section');
    }
  };

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
          관람 희망 일자를<br />선택해주세요.
        </motion.h2>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            delay: 0.3,
            type: "spring",
            stiffness: 100
          }}
          className="scaleIn"
        >
          <Calendar 
            selectedDate={currentDateInfo || null}
            onDateSelect={handleDateSelect}
            availableDates={availableDates}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="fadeInUp"
        >
          <motion.div
            whileHover={selectedDate ? { scale: 1.02 } : {}}
            transition={{ duration: 0.2 }}
          >
            <Button
              BoldText={location.state?.returnTo ? "수정 완료" : "희망 구역 선택하러 가기"}
              type={selectedDate ? 'primary' : 'disabled'}
              onClick={handleNextClick}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </PageTransition>
  );
};

export default BookingCalendarPage; 