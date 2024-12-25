// src/components/common/Status/Status.tsx
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';

const Status: React.FC = () => {
  const isActive = useSelector((state: RootState) => state.toggle.isActive);

  return (
    <div>
      <p>현재 상태: {isActive ? '활성화' : '비활성화'}</p>
    </div>
  );
};

export default Status;
