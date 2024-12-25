export interface Seat {
  id: string;
  section: string;
  row: string;
  number: string;
  status: 'available' | 'selected' | 'taken';
} 