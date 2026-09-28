export interface OpeningHourDay {
  day: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface CafeSettings {
  cafeName: string;
  tagline: string;
  logoUrl: string;
  address: string;
  phone: string;
  email: string;
  openingHours: OpeningHourDay[];
  socialLinks: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    youtube?: string;
  };
  currency: string;
  currencySymbol: string;
  taxRatePercent: number;
}

export interface WebsiteSettings {
  bannerEnabled: boolean;
  bannerText: string;
  bannerLink?: string;
  highlightedSpecialId?: string;
  orderOnlineEnabled: boolean;
  tableReservationEnabled: boolean;
  maintenanceMode: boolean;
}
