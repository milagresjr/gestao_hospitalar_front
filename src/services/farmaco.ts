import type { FarmacoType } from '@/types'
import api from './api'

export interface PaginatedFarmacos {
  data: FarmacoType[]
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export const fetchFarmacos = async (params: {
  page: number
  per_page: number
}): Promise<PaginatedFarmacos> => {
  const response = await api.get('farmacos', {
    params: {
      page: params.page,
      per_page: params.per_page,
    },
  })
  console.log('resposta API', response.data)
  return response.data
}

export const createFarmaco = async (farmacoData: FarmacoType) => {
  const response = await api.post('farmacos', farmacoData)
  return response.data
}

export const updateFarmaco = async ({ farmaco_id, ...data }: FarmacoType) => {
  const response = await api.put(`/farmacos/${farmaco_id}`, data)
  return response.data
}

export const deleteFarmaco = async (id: string) => {
  const response = await api.delete(`/farmacos/${id}`)
  return response.data
}
