// src/components/pages/TestPage.tsx
import React from 'react';
import Button from '../components/common/Button/Button';

const TestPage: React.FC = () => {
  // const handleClick = () => {
  //   alert('Primary Button 클릭!');
  // };

  return (
    <div style={{ padding: 'var(--spacing-large)', fontFamily: 'var(--font-family)' }}>
      {/* <h1 style={{ fontSize: 'var(--font-size-large)', marginBottom: 'var(--spacing-medium)' }}>
        컴포넌트 테스트 페이지
      </h1> */}

      {/* <section style={{ marginBottom: 'var(--spacing-large)' }}>
        <h2 style={{ fontSize: 'var(--font-size-medium)', marginBottom: 'var(--spacing-small)' }}>
          기본 버튼 테스트
        </h2> */}
    <Button BoldText="예매 정보 입력하러 가기" SubText='addsd' type="primary" onClick={() => alert('Primary Clicked!')} />
      {/* </section>

      <section>
        <h2 style={{ fontSize: 'var(--font-size-medium)', marginBottom: 'var(--spacing-small)' }}>
          비활성화된 버튼 테스트
        </h2>
        <Button text="Disabled Button" type="disabled" onClick={() => {}} />
      </section> */}
    </div>
  );
};

export default TestPage;
