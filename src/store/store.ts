import { configureStore } from '@reduxjs/toolkit';
import bookingReducer from './bookingSlice';
import headerReducer from './headerSlice';

export const store = configureStore({
  reducer: {
    booking: bookingReducer,
    header: headerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredPaths: ['header.backHandler'],
        ignoredActions: ['header/setBackHandler'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 