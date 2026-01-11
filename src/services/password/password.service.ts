import api from '@/common/api';
import type { GeneratePasswordRequestParams, GeneratePasswordResponse } from './password.types';

export const generatePassword = async ({
  params,
}: GeneratePasswordRequestParams): Promise<GeneratePasswordResponse> => {
  return await api.post('/passwords/generate', params).then((res) => res.data);
};
