import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import styles from './BookingCompletePage.module.css';

const BookingCompletePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingState = useSelector((state: RootState) => state.booking);
  
  const BOOKING_INFO = [
    {
      id: 'date',
      label: '예매 일자',
      value: bookingState.selectedDate 
        ? new Date(bookingState.selectedDate).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          })
        : '날짜를 선택해주세요',
      path: '/booking/calendar'
    },
    {
      id: 'section',
      label: '희망 구역',
      value: bookingState.selectedSections.length > 0
        ? bookingState.selectedSections.map(section => 
            section === 'FLOOR-A' ? 'FLOOR A' :
            section === 'FLOOR-B' ? 'FLOOR B' :
            section === 'FLOOR-C' ? 'FLOOR C' :
            section === '1F-LEFT' ? '1층 좌측 구역' :
            section === '1F-RIGHT' ? '1층 우측 구역' : section
          ).join(', ')
        : '구역을 선택해주세요',
      path: '/booking/section'
    },
    {
      id: 'seats',
      label: '관람자',
      value: bookingState.attendees.length > 0
        ? bookingState.attendees.map(attendee => attendee.name).join(', ')
        : '관람자 정보를 입력해주세요',
      path: '/booking/info'
    },
    {
      id: 'payment',
      label: '결제 정보',
      value: bookingState.isPrepaid 
        ? `${bookingState.selectedMethod === 'toss' ? 'Toss' : 
           bookingState.selectedMethod === 'kakao' ? '카카오' : 
           bookingState.selectedMethod === 'naver' ? '네이버' : '카드'} / 
           ${(bookingState.attendees.length * 136000).toLocaleString()}원`
        : '사전 결제가 진행되지 않음',
      path: '/booking/payment'
    }
  ];

  const handleItemClick = (path: string) => {
    navigate(path, { state: { returnTo: '/booking/complete' } });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        입력한 정보를<br />
        확인해주세요.
      </h1>
      <div className={styles.infoList}>
        {BOOKING_INFO.map(item => (
          <button
            key={item.id}
            className={styles.infoItem}
            onClick={() => handleItemClick(item.path)}
          >
            <div className={styles.label}>{item.label}</div>
            <div className={styles.valueWrapper}>
              <span className={styles.value}>{item.value}</span>
              <span className={styles.arrow}>›</span>
            </div>
          </button>
        ))}
      </div>
      <button 
        className={styles.confirmButton}
        onClick={() => navigate('/')}
      >
        확인
      </button>
    </div>
  );
};

export default BookingCompletePage; 