// src/components/common/Checkbox/Checkbox.tsx
import React from 'react';
import styles from './Checkbox.module.css';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onChange }) => {
  return (
    <label className={styles.checkbox}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className={styles.label}>{label}</span>
    </label>
  );
};

export default Checkbox;
