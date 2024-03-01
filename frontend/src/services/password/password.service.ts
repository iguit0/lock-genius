import api from '../api';
import {
  GeneratePasswordRequest,
  GeneratePasswordResponse,
} from './password.types';

export const generatePassword = async ({
  params,
}: {
  params: GeneratePasswordRequest;
}): Promise<GeneratePasswordResponse> => {
  return await api.post('/passwords/generate', params).then((res) => res.data);
};
