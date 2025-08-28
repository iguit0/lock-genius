import {
  GeneratePasswordRequestParams,
  GeneratePasswordResponse,
} from './password.types';

import api from '@/common/api';

export const generatePassword = async ({
  params,
}: GeneratePasswordRequestParams): Promise<GeneratePasswordResponse> => {
  return await api.post('/passwords/generate', params).then((res) => res.data);
};
