import Button from './Button';

export default {
  title: 'Components/Button', // Story의 위치
  component: Button,
};

export const Primary = {
  args: {
    BoldText: '예매 정보 입력하러 가기',
    SubText: 'addsd',
    type: 'primary',
  },
};
export const Disabled = () => <Button BoldText="Disabled Button" type="disabled" onClick={() => {}} />;
