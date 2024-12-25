import { Seat } from '../types/booking';

interface SectionSeats {
  [key: string]: Seat[];
}

// 실제 환경에서는 이 함수가 서버에서 데이터를 가져올 것입니다
export const fetchSectionSeats = async (sectionId: string): Promise<Seat[]> => {
  // TODO: 실제 API 호출로 대체
  return Array(160).fill(null).map((_, idx) => ({
    id: `${sectionId}-${idx}`,
    section: sectionId,
    row: String(Math.floor(idx / 16) + 1),
    number: String((idx % 16) + 1),
    status: 'available'
  }));
};

// 실제 환경에서는 이 함수가 서버에서 섹션 정보를 가져올 것입니다
export const fetchAvailableSections = async (): Promise<string[]> => {
  // TODO: 실제 API 호출로 대체
  return ['FLOOR-A', 'FLOOR-B', 'FLOOR-C', '1F-LEFT', '1F-RIGHT'];
};

// 실제 환경에서는 이 함수가 서버에 좌석 상태를 업데이트할 것입니다
export const updateSeatStatus = async (
  seatId: string, 
  status: 'available' | 'selected' | 'taken'
): Promise<void> => {
  // TODO: 실제 API 호출로 대체
  console.log(`Updating seat ${seatId} status to ${status}`);
}; 