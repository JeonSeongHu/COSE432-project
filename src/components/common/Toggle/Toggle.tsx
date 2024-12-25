// src/components/common/Toggle/Toggle.tsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { toggle } from '../../../store/toggleSlice';
import styles from './Toggle.module.css';

const Toggle: React.FC = () => {
  const dispatch = useDispatch();
  const isActive = useSelector((state: RootState) => state.toggle.isActive);

  const handleToggle = () => {
    dispatch(toggle());
  };

  return (
    <div
      className={`${styles.toggle} ${isActive ? styles.active : ''}`}
      onClick={handleToggle}
    >
      <div className={`${styles.knob} ${isActive ? styles.knobActive : ''}`} />
    </div>
  );
};

export default Toggle;
