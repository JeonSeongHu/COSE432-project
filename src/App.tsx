import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ConcertPage from './pages/ConcertPage';
import BookingCalendarPage from './pages/booking/BookingCalendarPage';
import BookingSectionPage from './pages/booking/BookingSectionPage';
import BookingInfoPage from './pages/booking/BookingInfoPage';
import BookingSeatPage from './pages/booking/BookingSeatPage';
import BookingPaymentPage from './pages/booking/BookingPaymentPage';
import BookingCompletePage from './pages/booking/BookingCompletePage';
import ManualBookingSeatPage from './pages/booking/ManualBookingSeatPage';
import BookingSuccessPage from './pages/BookingSuccessPage';
import BookingHistoryPage from './pages/booking/BookingHistoryPage';
import GaussianSplatting from './pages/GaussianSplatting';

import WaitingPage from './pages/WaitingPage';
import Container from './components/layout/Container';
import Header from './components/layout/Header';
import './styles/GlobalStyles.css';
import { Provider } from 'react-redux';
import { store } from './store/store';


const App: React.FC = () => (
  <Provider store={store}>
    <Router>
      <Container>
        <Header title="2024 AKMU 10th ANNIVERSARY C.." />
        <Routes>
          <Route path="/" element={<ConcertPage />} />
          <Route path="/booking/calendar" element={<BookingCalendarPage />} />
          <Route path="/booking/section" element={<BookingSectionPage />} />
          <Route path="/booking/seat" element={<BookingSeatPage />} />
          <Route path="/booking/info" element={<BookingInfoPage />} />
          <Route path="/booking/payment" element={<BookingPaymentPage />} />
          <Route path="/booking/complete" element={<BookingCompletePage />} />
          <Route path="/booking/waiting" element={<WaitingPage />} />
          <Route path="/booking/success" element={<BookingSuccessPage />} />
          <Route path="/booking/manual/seat" element={<ManualBookingSeatPage />} />
          <Route path="/history" element={<BookingHistoryPage />} />
          <Route path="/gaussian-splatting" element={<GaussianSplatting />} />
        </Routes>
      </Container>
    </Router>
  </Provider>
);

export default App;
