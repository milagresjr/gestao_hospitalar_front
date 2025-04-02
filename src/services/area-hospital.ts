import { AreaHospitalType } from '@/types';
import api from './api';

  export interface PaginatedAreaHospital {
    data: AreaHospitalType[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  }
  
  export const fetchAreaHospital = async (params: {
    page: number;
    per_page: number;
  }): Promise<PaginatedAreaHospital> => {
    const response = await api.get(`areas-hospital`, {
      params: {
        page: params.page,
        per_page: params.per_page,
      },
    });
    return response.data;
  };
  
export const createAreasHospital = async (areaHospitalData: AreaHospitalType) => {
  const response = await api.post('areas-hospital', areaHospitalData);
  return response.data;
};

export const updateAreaHospital = async ({ area_hospital_id, ...data }: AreaHospitalType) => {
  const response = await api.put(`/areas-hospital/${area_hospital_id}`, data);
  return response.data;
};

export const deleteAreaHospital = async (id: string) => {
  const response = await api.delete(`/areas-hospital/${id}`);
  return response.data;
};