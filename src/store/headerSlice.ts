import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface HeaderState {
  backHandler: (() => void) | null;
}

const initialState: HeaderState = {
  backHandler: null,
};

export const headerSlice = createSlice({
  name: 'header',
  initialState,
  reducers: {
    setBackHandler: (state, action: PayloadAction<(() => void) | null>) => {
      state.backHandler = action.payload;
    },
  },
});

export const { setBackHandler } = headerSlice.actions;

export default headerSlice.reducer; 