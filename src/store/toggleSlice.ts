import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// 상태 타입 정의
interface ToggleState {
  isActive: boolean;
}

// 초기 상태
const initialState: ToggleState = {
  isActive: false,
};

// Slice 생성
const toggleSlice = createSlice({
  name: 'toggle',
  initialState,
  reducers: {
    toggle: (state) => {
      state.isActive = !state.isActive;
    },
    setToggle: (state, action: PayloadAction<boolean>) => {
      state.isActive = action.payload;
    },
  },
});

export const { toggle, setToggle } = toggleSlice.actions;
export default toggleSlice.reducer;
