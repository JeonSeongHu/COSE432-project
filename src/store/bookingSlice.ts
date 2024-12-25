import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Seat } from '../types/booking';

type PaymentMethod = 'toss' | 'kakao' | 'naver';

export interface AttendeeInfo {
  name: string;
  birthDate: string;
  email: string;
}

export interface BookedTicket {
  seats: Seat[];
  date: string;
  time: string;
  paymentMethod: PaymentMethod;
  amount: number;
  bookedAt: string;
}

interface BookingState {
  // 섹션 선택 관련
  selectedSections: string[];
  selectedSeats: Seat[];
  currentSection: string;
  sectionSeats: Record<string, Seat[]>;

  // 예매 정보 관련
  selectedDate: string | null;
  selectedTime: string | null;
  guestCount: number;
  
  // 결제 관련
  selectedMethod: PaymentMethod;
  isPrepaid: boolean;

  // 관람자 정보 관련
  attendees: AttendeeInfo[];

  // 실제 예매 완료된 티켓 정보
  bookedTickets: BookedTicket[];
}

const initialState: BookingState = {
  selectedSections: [],
  selectedSeats: [],
  currentSection: '',
  sectionSeats: {},
  selectedDate: null,
  selectedTime: null,
  guestCount: 1,
  selectedMethod: 'toss',
  isPrepaid: false,
  attendees: [],
  bookedTickets: [],
};

export const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    // 섹션 선택 관련 액션
    setSelectedSections: (state, action: PayloadAction<string[]>) => {
      state.selectedSections = action.payload;
    },
    addSection: (state, action: PayloadAction<string>) => {
      if (!state.selectedSections.includes(action.payload)) {
        state.selectedSections.push(action.payload);
      }
    },
    removeSection: (state, action: PayloadAction<string>) => {
      state.selectedSections = state.selectedSections.filter(
        section => section !== action.payload
      );
    },
    setSelectedSeats: (state, action: PayloadAction<Seat[]>) => {
      state.selectedSeats = action.payload;
    },
    setCurrentSection: (state, action: PayloadAction<string>) => {
      state.currentSection = action.payload;
    },
    setSectionSeats: (state, action: PayloadAction<{ sectionId: string; seats: Seat[] }>) => {
      state.sectionSeats[action.payload.sectionId] = action.payload.seats;
    },

    // 예매 정보 관련 액션
    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
    },
    setSelectedTime: (state, action: PayloadAction<string>) => {
      state.selectedTime = action.payload;
    },
    setGuestCount: (state, action: PayloadAction<number>) => {
      state.guestCount = action.payload;
    },

    // 결제 관련 액션
    setPaymentMethod: (state, action: PayloadAction<PaymentMethod>) => {
      state.selectedMethod = action.payload;
    },
    setIsPrepaid: (state, action: PayloadAction<boolean>) => {
      state.isPrepaid = action.payload;
    },

    // 관람자 정보 관련 액션
    setAttendees: (state, action: PayloadAction<AttendeeInfo[]>) => {
      state.attendees = action.payload;
    },

    // 초기화
    resetBooking: (state) => {
      return initialState;
    },

    updateSeatStatus: (state, action: PayloadAction<{ seatId: string; status: 'available' | 'selected' | 'taken' }>) => {
      const { seatId, status } = action.payload;
      const sectionId = seatId.split('-')[0] + '-' + seatId.split('-')[1];
      const sectionSeats = state.sectionSeats[sectionId];
      
      if (sectionSeats) {
        const seat = sectionSeats.find(s => s.id === seatId);
        if (seat) {
          seat.status = status;
        }
      }

      // 선택된 좌석 목록도 업데이트
      const selectedSeat = state.selectedSeats.find(s => s.id === seatId);
      if (selectedSeat) {
        selectedSeat.status = status;
      }
    },

    // 예매 완료 티켓 추가
    addBookedTicket: (state, action: PayloadAction<BookedTicket>) => {
      state.bookedTickets.push(action.payload);
    },

    // 예매 완료 후 선택 정보 초기화
    clearBookingSelection: (state) => {
      state.selectedSeats = [];
      state.selectedSections = [];
      state.currentSection = '';
      state.sectionSeats = {};
      state.selectedDate = null;
      state.selectedTime = null;
      state.guestCount = 1;
      state.selectedMethod = 'toss';
      state.isPrepaid = false;
      state.attendees = [];
    },
  },
});

export const {
  setSelectedSections,
  addSection,
  removeSection,
  setSelectedSeats,
  setCurrentSection,
  setSectionSeats,
  setSelectedDate,
  setSelectedTime,
  setGuestCount,
  setPaymentMethod,
  setAttendees,
  resetBooking,
  updateSeatStatus,
  setIsPrepaid,
  addBookedTicket,
  clearBookingSelection,
} = bookingSlice.actions;

export default bookingSlice.reducer; 