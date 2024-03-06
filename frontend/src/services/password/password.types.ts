export type GeneratePasswordRequest = {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
};

export type GeneratePasswordRequestParams = {
  params: GeneratePasswordRequest;
};

export type GeneratePasswordResponse = {
  password: string;
};
