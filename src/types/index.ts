export interface User {
  id: string;
  fullName: string;
  email: string;
  isVerified: boolean;
  jobTitle: string;
  companyName: string;
  verifiedBadges: string[];
}

export interface MicroTable {
  id: string;
  hostId: string;
  hostName: string;
  hostRole: string;
  hostCompany: string;
  topicTitle: string;
  category: string;
  maxSeats: number;
  reservedSeats: number;
  seatPriceINR: number;
  scheduledAt: string;
  venueName: string;
  coordinates: { lat: number; lng: number };
  topicsCovered: string[];
}

export interface SeatBooking {
  id: string;
  tableId: string;
  userId: string;
  status: string;
  bookedAt: string;
}
