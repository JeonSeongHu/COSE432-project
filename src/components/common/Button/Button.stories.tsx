import React from 'react';
import Button from './Button';

export default {
  title: 'Components/Button', // Story의 위치
  component: Button,
};

export const Primary = () => <Button BoldText="예매 정보 입력하러 가기" SubText='addsd' type="primary" onClick={() => alert('Primary Clicked!')} />;
export const Disabled = () => <Button BoldText="Disabled Button" type="disabled" onClick={() => {}} />;
