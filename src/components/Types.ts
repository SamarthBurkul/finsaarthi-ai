export interface BankLocation {
  id: string;
  name: string;
  type: 'bank' | 'atm';
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  distance: number;
  phone?: string;
  hours?: string;
}