
export interface Ticket {
  number: number;
  isSold: boolean;
  soldAt?: number;
  lastUpdatedBy?: string;
}

export type FilterType = 'all' | 'available' | 'sold';

export interface SyncMessage {
  type: 'TICKET_UPDATE';
  payload: {
    number: number;
    isSold: boolean;
    timestamp: number;
  };
}
