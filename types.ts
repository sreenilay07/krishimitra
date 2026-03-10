
export enum Language {
  EN = 'EN',
  HI = 'HI',
  TE = 'TE',
}

export enum Feature {
  CROP_DOCTOR = 'CROP_DOCTOR',
  YIELD_PREDICTION = 'YIELD_PREDICTION',
  MARKET_PRICE = 'MARKET_PRICE',
  CROP_RECOMMENDATION = 'CROP_RECOMMENDATION',
  QUALITY_CHECKER = 'QUALITY_CHECKER',
  CLIMATE_ADVISORY = 'CLIMATE_ADVISORY',
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string;
}
