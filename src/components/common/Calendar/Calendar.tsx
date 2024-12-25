import React from 'react';
import styles from './Calendar.module.css';

interface DateInfo {
  date: Date;
  time: string;
  capacity: string;
  currentBooking: string;
  competitionRate: string;
}

interface CalendarProps {
  selectedDate: DateInfo | null;
  onDateSelect: (dateInfo: DateInfo) => void;
  availableDates: DateInfo[];
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateSelect, availableDates }) => {
  const renderCalendarDays = () => {
    const days = [];
    const daysInMonth = new Date(2024, 11, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(2024, 10, i);
      const dateInfo = availableDates.find(d => d.date.getDate() === i);
      const isAvailable = !!dateInfo;
      const isSelected = selectedDate?.date.getDate() === i;

      days.push(
        <button
          key={i}
          className={`${styles.day} 
            ${isAvailable ? styles.available : styles.disabled}
            ${isSelected ? styles.selected : ''}`}
          onClick={() => isAvailable && onDateSelect(dateInfo!)}
          disabled={!isAvailable}
        >
          {i}
        </button>
      );
    }
    return days;
  };

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.calendar}>
        <div className={styles.header}>
          <button className={styles.monthButton}>◀</button>
          <h3>2024년 11월</h3>
          <button className={styles.monthButton}>▶</button>
        </div>
        <div className={styles.weekdays}>
          <div className={styles.weekday}>S</div>
          <div className={styles.weekday}>M</div>
          <div className={styles.weekday}>T</div>
          <div className={styles.weekday}>W</div>
          <div className={styles.weekday}>T</div>
          <div className={styles.weekday}>F</div>
          <div className={styles.weekday}>S</div>
        </div>
        <div className={styles.days}>
          {renderCalendarDays()}
        </div>
      </div>
      {selectedDate && (
        <div className={styles.dateInfo}>
          <h3>{`11월 ${selectedDate.date.getDate()}일 (${['일','월','화','수','목','금','토'][selectedDate.date.getDay()]})`}</h3>
          <div className={styles.infoGrid}>
            <div>⏰ {selectedDate.time}</div>
            <div>👥 수용 인원 {selectedDate.capacity}명</div>
            <div>🎫 희망 인원 {selectedDate.currentBooking}명</div>
            <div>📊 경쟁률 {selectedDate.competitionRate}</div>
          </div>
          <div className={styles.venueStatus}>
            배치도 현황
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar; 