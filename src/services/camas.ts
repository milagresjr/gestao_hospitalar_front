import { CamaType } from '@/types';
import api from './api';

export const fetchCamas = async () => {
    try {
      const response = await api.get('camas');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar as camas:', error);
      throw error; // Você pode querer lançar o erro novamente ou retornar um valor padrão
    }
  };
  
export const createCamas = async (camaData: CamaType) => {
  const response = await api.post('camas', camaData);
  return response.data;
};