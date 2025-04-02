import type { SalaType } from '@/types'
import api from './api'

export interface PaginatedSalas {
  data: SalaType[]
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export const fetchSalas = async (params: {
  page: number
  per_page: number
}): Promise<PaginatedSalas> => {
  const response = await api.get('salas', {
    params: {
      page: params.page,
      per_page: params.per_page,
    },
  })
  return response.data
}

export const createSala = async (salaData: SalaType) => {
  const response = await api.post('salas', salaData)
  return response.data
}

export const updateSala = async ({ sala_id, ...data }: SalaType) => {
  const response = await api.put(`salas/${sala_id}`, data)
  return response.data
}

export const deleteSala = async (id: string) => {
  const response = await api.delete(`salas/${id}`)
  return response.data
}
