// src/components/common/Input/Input.tsx
import React from 'react';
import styles from './Input.module.css';

interface InputProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

const Input: React.FC<InputProps> = ({ placeholder, value, onChange }) => {
  return (
    <input
      className={styles.input}
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

export default Input;
