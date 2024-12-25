import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import Button from '../components/common/Button/Button';
import Accordion from '../components/common/Accordion/Accordion';
import styles from './ConcertPage.module.css';

const ConcertPage: React.FC = () => {
  const navigate = useNavigate();
  const [isBookingEnabled, setIsBookingEnabled] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const attendees = useSelector((state: RootState) => state.booking.attendees);
  
  useEffect(() => {
    if (attendees.length > 0 && !isBookingEnabled) {
      let timeLeft = 2;
      setCountdown(timeLeft);

      const countdownInterval = setInterval(() => {
        timeLeft -= 1;
        setCountdown(timeLeft);
        
        if (timeLeft <= 0) {
          setIsBookingEnabled(true);
          clearInterval(countdownInterval);
        }
      }, 1000);

      return () => {
        clearInterval(countdownInterval);
      };
    }
  }, [attendees.length, isBookingEnabled]);

  return (
    <div className={styles['page-container']}>
      <div className={styles['concert-container']}>
        <div className={styles['concert-info']}>
          <div className={styles['concert-detail']}>
            <div className={styles['concert-header']}>
              <span>🔥 122명이 함께 기다리고 있어요.</span>
              <h1>2024 AKMU 10th ANNIVERSARY CONCERT [1OVE]</h1>
            </div>
            <div className={styles['concert-detail-tags-container']}>
              <p className={styles['concert-detail-tag']}>#AKMU</p>
              <p className={styles['concert-detail-tag']}>#CONCERT1</p>
            </div>
            <p>📍 서울특별시 종로구 올림픽공원 아트홀</p>
            <p>📅 2024.11.14(일) - 2024.11.16(월)</p>
            <p>💲 50,000원 - 136,000원</p>
          </div>
          <div className={styles['concert-image']}>
            <img 
              src="https://placehold.co/300x400/011111/ffffff?text=AKMU+CONCERT" 
              alt="AKMU 콘서트 이미지" 
              loading="lazy"
            />
          </div>
        </div>
        <div className={styles['concert-container']}>
          <Accordion title="예매 전 유의사항" defaultOpen={true}>
            <div className={styles['concert-notice']}>
              <ul>
                <li>취소마감시간 이후 또는 관람일 당일 예매하신 건에 대해서는 취소/변경/환불이 불가합니다.</li>
                <li>예매수수료는 예매 당일 밤 12시 이전까지 취소 시 환불 가능합니다.</li>
              </ul>
            </div>
          </Accordion>

          <Accordion title="공연 상세 정보">
            <div className={styles['concert-notice']}>
              <ul>
                <li>공연 시간: 120분</li>
                <li>관람 연령: 8세 이상</li>
                <li>좌석 등급: VIP석, R석, S석</li>
              </ul>
            </div>
          </Accordion>

          <Accordion title="할인 정보">
            <div className={styles['concert-notice']}>
              <ul>
                <li>장애인 동반 1인 50% 할인</li>
                <li>국가유공자 본인 50% 할인</li>
                <li>학생 할인 20% (현장수령시 학생증 필수)</li>
              </ul>
            </div>
          </Accordion>
        </div>

        <div className={styles['booking-buttons']}>
          <Button 
            BoldText={attendees.length > 0 
              ? "예매 정보 수정하기"
              : "예매 정보 사전 입력"} 
            SubText={attendees.length > 0 
                ? "" 
                : "예매 정보를 먼저 입력하고 빠르게 티켓팅하세요!"} 
            type={attendees.length > 0 ? 'secondary' : 'primary'}
            onClick={() => navigate('/booking/calendar')} 
          />
          <Button 
            BoldText="예매하기" 
            SubText={attendees.length > 0 
              ? isBookingEnabled 
                ? "예매를 시작하세요!" 
                : `${countdown}초 후에 활성화됩니다`
              : "정보를 먼저 입력해주세요."} 
            type={isBookingEnabled ? 'primary' : 'disabled'} 
            onClick={() => isBookingEnabled && navigate('/booking/waiting')} 
          />
        </div>
      </div>
    </div>
  );
};

export default ConcertPage; 