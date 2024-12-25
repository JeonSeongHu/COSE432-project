import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import styles from './Header.module.css';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const backHandler = useSelector((state: RootState) => state.header.backHandler);

  const handleBack = () => {
    if (location.pathname === '/') {
      return;
    }
    if (backHandler) {
      backHandler();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className={styles.header}>
      <button 
        className={styles.backButton} 
        onClick={handleBack}
        style={{ visibility: location.pathname === '/' ? 'hidden' : 'visible' }}
      >
        ←
      </button>
      <h1 className={styles.title}>{title}</h1>
      <button className={styles.likeButton}>♡</button>
    </header>
  );
};

export default Header; 