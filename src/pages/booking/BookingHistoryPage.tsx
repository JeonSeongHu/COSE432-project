import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../store/store';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../components/common/Button/Button';
import PageTransition from '../../components/layout/PageTransition';
import styles from './BookingPage.module.css';

const BookingHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { bookedTickets } = useSelector((state: RootState) => state.booking);

  // 예매 내역이 없는 경우 빈 화면 표시
  if (bookedTickets.length === 0) {
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
            예매 내역
          </motion.h2>
          <motion.div 
            className={`${styles.emptyHistory} fadeIn`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              예매 내역이 없습니다.
            </motion.p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
          >
            <Button
              BoldText="홈으로 돌아가기"
              type="secondary"
              onClick={() => navigate('/')}
            />
          </motion.div>
        </motion.div>
      </PageTransition>
    );
  }

  const formatSeatInfo = (seat: any) => {
    const row = Math.floor(Number(seat.id.split('-')[2]) / 16) + 1;
    const col = (Number(seat.id.split('-')[2]) % 16) + 1;
    return `${seat.section} ${row}열 ${col}번`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
          예매 내역
        </motion.h2>

        <motion.div 
          className={styles.bookingHistory}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <AnimatePresence>
            {bookedTickets.map((ticket, index) => (
              <motion.div 
                key={index} 
                className={`${styles.historyCard} transition-all`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1) }}
                whileHover={{ scale: 1.02 }}
              >
                <motion.div 
                  className={styles.historyHeader}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.h3
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    2024 AKMU 10th ANNIVERSARY CONCERT [1OVE]
                  </motion.h3>
                  <motion.span 
                    className={`${styles.historyStatus} fadeIn`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    예매 완료
                  </motion.span>
                </motion.div>

                <motion.div 
                  className={styles.historyContent}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <motion.div 
                    className={styles.historyItem}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <span className={styles.label}>공연 일시</span>
                    <span className={styles.value}>{ticket.date} {ticket.time}</span>
                  </motion.div>

                  <motion.div 
                    className={styles.historyItem}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <span className={styles.label}>예매 좌석</span>
                    <motion.div className={styles.seatList}>
                      {ticket.seats.map((seat, seatIndex) => (
                        <motion.span 
                          key={seat.id} 
                          className={`${styles.seatItem} transition-all`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * (seatIndex + 1) }}
                          whileHover={{ scale: 1.05 }}
                        >
                          {seatIndex + 1}. {formatSeatInfo(seat)}
                        </motion.span>
                      ))}
                    </motion.div>
                  </motion.div>

                  <motion.div 
                    className={styles.historyItem}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <span className={styles.label}>결제 금액</span>
                    <span className={styles.value}>{ticket.amount.toLocaleString()}원</span>
                  </motion.div>

                  <motion.div 
                    className={styles.historyItem}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                  >
                    <span className={styles.label}>결제 일시</span>
                    <span className={styles.value}>{formatDate(ticket.bookedAt)}</span>
                  </motion.div>

                  <motion.div 
                    className={styles.historyItem}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 }}
                  >
                    <span className={styles.label}>결제 수단</span>
                    <span className={styles.value}>
                      {ticket.paymentMethod === 'toss' ? '토스' :
                       ticket.paymentMethod === 'kakao' ? '카카오페이' :
                       '네이버페이'}
                    </span>
                  </motion.div>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="fadeInUp"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              BoldText="홈으로 돌아가기"
              type="secondary"
              onClick={() => navigate('/')}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </PageTransition>
  );
};

export default BookingHistoryPage; 