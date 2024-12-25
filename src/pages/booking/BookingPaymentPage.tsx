import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setPaymentMethod, setIsPrepaid, addBookedTicket } from '../../store/bookingSlice';
import type { RootState } from '../../store/store';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../components/common/Button/Button';
import Accordion from '../../components/common/Accordion/Accordion';
import PageTransition from '../../components/layout/PageTransition';
import styles from './BookingPage.module.css';

type PaymentMethod = 'toss' | 'kakao' | 'naver';

const BookingPaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const {
    selectedMethod,
    selectedSeats,
    selectedDate,
    selectedTime,
  } = useSelector((state: RootState) => state.booking);
  const [showAgreement, setShowAgreement] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const isPrePayment = !location.state?.seats; // 좌석 정보가 없으면 사전 결제로 간주

  const paymentMethods = [
    { id: 'toss', name: '토스', icon: '🔵', type: 'toss' },
    { id: 'kakao', name: '카카오페이', icon: '🟡', type: 'kakao' },
    { id: 'naver', name: '네이버페이', icon: '🟢', type: 'naver' }
  ];

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    dispatch(setPaymentMethod(method));
  };

  const handlePrePayment = () => {
    if (!selectedMethod) {
      alert('결제 수단을 선택해주세요.');
      return;
    }

    if (isPrePayment) {
      setShowAgreement(true);
    } else {
      handlePayment();
    }
  };

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      // 결제 처리 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 예매 정보 저장
      dispatch(addBookedTicket({
        seats: selectedSeats,
        date: selectedDate || '',
        time: selectedTime || '',
        paymentMethod: selectedMethod,
        amount: selectedSeats.length * 150000, // 좌석당 15만원
        bookedAt: new Date().toISOString(),
      }));

      dispatch(setIsPrepaid(true));

      // 실제 결제인 경우 success로, 사전 결제인 경우 complete로 이동
      const successPath = isPrePayment ? '/booking/complete' : '/booking/success';
      const returnTo = location.state?.returnTo || successPath;
      
      navigate(returnTo);
    } catch (error) {
      alert('결제에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLaterPayment = () => {
    dispatch(setIsPrepaid(false));
    navigate('/booking/complete');
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
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="fadeInDown"
        >
          결제 정보를<br />입력해주세요
        </motion.h2>

        <motion.p 
          className={`${styles.priceInfo} fadeInUp`}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          예상 결제액 {(selectedSeats.length * 150000).toLocaleString()}원
        </motion.p>

        <motion.div 
          className={styles.paymentSections}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <motion.div 
            className={`${styles.paymentAccordion} transition-all`}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Accordion title="무통장 입금" defaultOpen={false}>
              <motion.div 
                className={`${styles.paymentContent} fadeIn`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p>준비중입니다.</p>
              </motion.div>
            </Accordion>
          </motion.div>

          <motion.div 
            className={`${styles.paymentAccordion} transition-all`}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Accordion title="신용 카드" defaultOpen={false}>
              <motion.div 
                className={`${styles.paymentContent} fadeIn`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p>준비중입니다.</p>
              </motion.div>
            </Accordion>
          </motion.div>

          <motion.div 
            className={`${styles.paymentAccordion} transition-all`}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Accordion title="간편 결제" defaultOpen={true}>
              <motion.div 
                className={`${styles.paymentContent} fadeIn`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div 
                  className={styles.paymentMethods}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {paymentMethods.map((method, index) => (
                    <motion.button
                      key={method.id}
                      className={`${styles.paymentMethod} ${
                        selectedMethod === method.id ? styles.selected : ''
                      } transition-all`}
                      data-type={method.type}
                      onClick={() => handlePaymentMethodSelect(method.id as PaymentMethod)}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * (index + 1) }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.span 
                        className={styles.paymentIcon}
                        animate={{ 
                          rotate: selectedMethod === method.id ? [0, 360] : 0 
                        }}
                        transition={{ duration: 0.5 }}
                      >
                        {method.icon}
                      </motion.span>
                      <span>{method.name}</span>
                    </motion.button>
                  ))}
                </motion.div>
              </motion.div>
            </Accordion>
          </motion.div>
        </motion.div>

        <motion.div 
          className={styles.buttonGroup}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <motion.div
            whileHover={selectedMethod && !isProcessing ? { scale: 1.02 } : {}}
            transition={{ duration: 0.2 }}
          >
            <Button
              BoldText={isProcessing ? "결제 처리 중..." : "결제하기"}
              type={selectedMethod && !isProcessing ? 'primary' : 'disabled'}
              onClick={handlePrePayment}
            />
          </motion.div>
          {isPrePayment && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Button
                BoldText="나중에 결제하기"
                type="secondary"
                onClick={handleLaterPayment}
              />
            </motion.div>
          )}
        </motion.div>

        <AnimatePresence>
          {showAgreement && (
            <motion.div 
              className={styles.modalOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className={`${styles.agreementModal} scaleIn`}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  className={styles.modalContent}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.h3
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    사전 결제 안내
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    사전 결제는 티켓팅 시작 이전에 결제를 진행하여,<br/>
                    티켓팅 중간 과정에서 결제 실패로 인한 어려움을<br/>
                    방지하기 위한 기능입니다.<br/><br/>
                    일정 시간 이내로 좌석 선택에 실패할 경우,<br/>
                    모든 금액은 수수료 없이 전액 환불됩니다.<br/><br/>
                  
                    실제 티켓팅 과정에서 추가 금액이 발생할 경우,<br/>
                    추가 결제 혹은 일부 환불이 이루어질 수 있습니다. <br/>
                  
                  </motion.p>
                  <motion.div 
                    className={styles.modalButtons}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <motion.button 
                      onClick={handlePayment}
                      disabled={isProcessing}
                      className="transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isProcessing ? "처리 중..." : "동의하고 진행하기"}
                    </motion.button>
                    <motion.button 
                      onClick={() => setShowAgreement(false)}
                      className="transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      취소
                    </motion.button>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </PageTransition>
  );
};

export default BookingPaymentPage; 