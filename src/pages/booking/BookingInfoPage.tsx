import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setAttendees, setGuestCount } from '../../store/bookingSlice';
import type { RootState } from '../../store/store';
import type { AttendeeInfo } from '../../store/bookingSlice';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../components/common/Button/Button';
import Accordion from '../../components/common/Accordion/Accordion';
import PageTransition from '../../components/layout/PageTransition';
import styles from './BookingPage.module.css';

// 유효성 검사 상태를 위한 인터페이스 추가
interface ValidationErrors {
  name: string;
  birthDate: string;
  email: string;
}

const BookingInfoPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const guestCount = useSelector((state: RootState) => state.booking.guestCount);
  const storedAttendees = useSelector((state: RootState) => state.booking.attendees);

  // Initialize attendees with stored data if available
  const [attendees, setLocalAttendees] = useState<AttendeeInfo[]>(
    storedAttendees.length > 0 ? storedAttendees : [{ name: '', birthDate: '', email: '' }]
  );

  // 각 참석자별 에러 상태 관리
  const [errors, setErrors] = useState<ValidationErrors[]>(
    attendees.map(() => ({ name: '', birthDate: '', email: '' }))
  );

  const handleAddAttendee = () => {
    if (attendees.length < 3) {
      setLocalAttendees([...attendees, { name: '', birthDate: '', email: '' }]);
      setErrors([...errors, { name: '', birthDate: '', email: '' }]);
      dispatch(setGuestCount(attendees.length + 1));
    }
  };

  const handleRemoveAttendee = (index: number) => {
    const newAttendees = attendees.filter((_, i) => i !== index);
    const newErrors = errors.filter((_, i) => i !== index);
    setLocalAttendees(newAttendees);
    setErrors(newErrors);
    dispatch(setGuestCount(newAttendees.length));
  };

  const handleInputChange = (index: number, field: keyof AttendeeInfo, value: string) => {
    const newAttendees = [...attendees];
    newAttendees[index] = { ...newAttendees[index], [field]: value };
    setLocalAttendees(newAttendees);
    
    // 해당 필드 유효성 검사
    const newErrors = [...errors];
    newErrors[index] = { ...newErrors[index] };
    
    switch (field) {
      case 'name':
        newErrors[index].name = value.trim() === '' ? '이름을 입력주세요.' : '';
        break;
      case 'birthDate':
        newErrors[index].birthDate = value.trim() === '' ? '생년월일을 입력해주세요.' : '';
        break;
      case 'email':
        if (value.trim() === '') {
          newErrors[index].email = '이메일을 입력해주세요.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors[index].email = '올바른 이메일 형식이 아닙니다.';
        } else {
          newErrors[index].email = '';
        }
        break;
    }
    
    setErrors(newErrors);
  };

  const isFormValid = () => {
    return attendees.every(attendee => {
      const isNameValid = attendee.name.trim() !== '';
      const isBirthDateValid = attendee.birthDate.trim() !== '';
      const isEmailValid = attendee.email.trim() !== '' && 
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(attendee.email);
      
      return isNameValid && isBirthDateValid && isEmailValid;
    });
  };

  useEffect(() => {
    console.log('Form Valid:', isFormValid());
    console.log('Attendees:', attendees);
  }, [attendees]);

  const handleNextClick = () => {
    if (isFormValid()) {
      if (attendees.length > 0) {
        const validAttendees = attendees.filter(attendee => 
          attendee.name && 
          attendee.birthDate && 
          attendee.email
        );
        
        if (validAttendees.length > 0) {
          dispatch(setAttendees(validAttendees));
          dispatch(setGuestCount(validAttendees.length));
          const returnTo = location.state?.returnTo;
          if (returnTo) {
            navigate(returnTo);
          } else {
            navigate('/booking/payment');
          }
        } else {
          alert('최소 1명의 관람자 정보가 필요합니다.');
        }
      } else {
        alert('최소 1명의 관람자 정보가 필요합니다.');
      }
    } else {
      alert('모든 정보를 올바르게 입력해주세요.');
    }
  };

  return (
    <PageTransition>
      <div className={styles.container}>
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          관람자의 정보를<br />입력해주세요.
        </motion.h2>
        <motion.p 
          className={styles.subText}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          최대 3명까지 등록 가능합니다.
        </motion.p>

        <motion.div 
          className={styles.attendeeList}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <AnimatePresence>
            {attendees.map((attendee, index) => (
              <motion.div 
                key={index} 
                className={styles.attendeeAccordion}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Accordion 
                  title={attendee.name ? `관람자 ${index + 1} - ${attendee.name}` : `관람자 ${index + 1}`}
                  defaultOpen={index === 0}
                >
                  <motion.div 
                    className={styles.attendeeForm}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <motion.div 
                      className={styles.inputGroup}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <label>이름</label>
                      <motion.input
                        type="text"
                        value={attendee.name}
                        onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                        placeholder="이름"
                        className="transition-all"
                        whileFocus={{ scale: 1.02 }}
                      />
                      {errors[index].name && (
                        <motion.span 
                          className={styles.errorText}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          {errors[index].name}
                        </motion.span>
                      )}
                    </motion.div>

                    <motion.div 
                      className={styles.inputGroup}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <label>생년월일</label>
                      <motion.input
                        type="date"
                        value={attendee.birthDate}
                        onChange={(e) => handleInputChange(index, 'birthDate', e.target.value)}
                        className="transition-all"
                        whileFocus={{ scale: 1.02 }}
                      />
                      {errors[index].birthDate && (
                        <motion.span 
                          className={styles.errorText}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          {errors[index].birthDate}
                        </motion.span>
                      )}
                    </motion.div>

                    <motion.div 
                      className={styles.inputGroup}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <label>이메일</label>
                      <motion.input
                        type="email"
                        value={attendee.email}
                        onChange={(e) => handleInputChange(index, 'email', e.target.value)}
                        placeholder="example@email.com"
                        className="transition-all"
                        whileFocus={{ scale: 1.02 }}
                      />
                      {errors[index].email && (
                        <motion.span 
                          className={styles.errorText}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          {errors[index].email}
                        </motion.span>
                      )}
                    </motion.div>

                    {index > 0 && (
                      <motion.button 
                        className={`${styles.removeAttendeeButton} transition-all`}
                        onClick={() => handleRemoveAttendee(index)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        삭제하기
                      </motion.button>
                    )}
                  </motion.div>
                </Accordion>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {attendees.length < 3 && (
          <motion.button 
            className={`${styles.addAttendeeButton} transition-all`}
            onClick={handleAddAttendee}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            + 다른 관람자 추가하기
          </motion.button>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <motion.div
            whileHover={isFormValid() ? { scale: 1.02 } : {}}
            transition={{ duration: 0.2 }}
          >
            <Button
              BoldText={location.state?.returnTo ? "수정 완료" : "결제 정보 입력하러 가기"}
              type={isFormValid() ? 'primary' : 'disabled'}
              onClick={handleNextClick}
            />
          </motion.div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default BookingInfoPage; 