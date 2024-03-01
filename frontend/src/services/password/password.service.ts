import { AxiosResponse } from 'axios';

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
  try {
    const { data }: AxiosResponse<GeneratePasswordResponse> = await api.post(
      '/passwords/generate',
      params
    );
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
