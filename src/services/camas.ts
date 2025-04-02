import type { CamaType } from '@/types'
import api from './api'

// export const fetchCamas = async (params: { page: number; limit: number }) => {
//     try {
//       const response = await api.get(`camas?page=${params.page}&limit=${params.limit}`);
//       return response.data;
//     } catch (error) {
//       console.error('Erro ao buscar as camas:', error);
//       throw error; // Você pode querer lançar o erro novamente ou retornar um valor padrão
//     }
//   };

export interface PaginatedCamas {
  data: CamaType[]
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export const fetchCamas = async (params: {
  page: number
  per_page: number
}): Promise<PaginatedCamas> => {
  const response = await api.get('camas', {
    params: {
      page: params.page,
      per_page: params.per_page,
    },
  })
  console.log('Resposta: ', response.data)
  return response.data
}

export const createCamas = async (camaData: CamaType) => {
  const response = await api.post('camas', camaData)
  return response.data
}

export const updateCama = async ({ cama_id, ...data }: CamaType) => {
  const response = await api.put(`/camas/${cama_id}`, data)
  return response.data
}

export const deleteCama = async (id: string) => {
  const response = await api.delete(`/camas/${id}`)
  return response.data
}
