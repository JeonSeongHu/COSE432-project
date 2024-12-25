import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import WaitingPage from './WaitingPage';
import type { Seat } from '../types/booking';

const mockStore = configureStore([]);

const initialState = {
  booking: {
    selectedSeats: [
      { id: '1', section: 'A', row: 1, number: 1, status: 'available' },
      { id: '2', section: 'A', row: 1, number: 2, status: 'available' },
    ] as Seat[],
  },
};

const store = mockStore(initialState);

describe('WaitingPage', () => {
  test('renders waiting message and countdown', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <WaitingPage />
        </BrowserRouter>
      </Provider>
    );

    // Check initial render
    expect(screen.getByText('예매 대기중')).toBeInTheDocument();
    expect(screen.getByText(/예상 대기 시간/)).toBeInTheDocument();

    // Wait for countdown to change
    await waitFor(() => expect(screen.getByText('0초')).toBeInTheDocument(), { timeout: 20000 });
  }, 20000);
}); 