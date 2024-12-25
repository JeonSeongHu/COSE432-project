// src/components/common/Button/Button.tsx
import React from 'react';
import styles from './Button.module.css';

interface ButtonProps {
  BoldText: string;
  SubText?: string;
  type?: 'primary' | 'secondary' | 'disabled';
  onClick: () => void;
}

const Button: React.FC<ButtonProps> = ({ BoldText, SubText, type = 'primary', onClick }) => {
  return (
    <button 
      className={`${styles.button} ${styles[type]}`} 
      onClick={onClick}
      disabled={type === 'disabled'}
    >
      <span className={styles.boldText}>{BoldText}</span>
      {SubText && <span className={styles.subText}>{SubText}</span>}
    </button>
  );
};

export default Button;
