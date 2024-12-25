import React from 'react';
import { motion } from 'framer-motion';
import styles from './PageTransition.module.css';

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 5 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ 
        duration: 0.3,
        ease: "easeInOut"
      }}
      className={`${styles.page} transition-all`}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition; 