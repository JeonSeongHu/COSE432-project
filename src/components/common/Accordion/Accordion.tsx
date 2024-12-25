import React, { useState } from 'react';
import styles from './Accordion.module.css';

interface AccordionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  onTitleClick?: () => void;
  className?: string;
}

const Accordion: React.FC<AccordionProps> = ({ 
  title, 
  defaultOpen = false, 
  children, 
  onTitleClick,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleClick = () => {
    setIsOpen(!isOpen);
    onTitleClick?.();
  };

  return (
    <div className={`${styles.accordion} ${className}`}>
      <button className={styles.header} onClick={handleClick}>
        <span>{title}</span>
        <span className={`${styles.arrow} ${isOpen ? styles.open : ''}`}>▼</span>
      </button>
      {isOpen && <div className={styles.content}>{children}</div>}
    </div>
  );
};

export default Accordion; 