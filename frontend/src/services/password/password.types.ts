export type GeneratePasswordRequest = {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
};

export type GeneratePasswordResponse = {
  password: string;
};
