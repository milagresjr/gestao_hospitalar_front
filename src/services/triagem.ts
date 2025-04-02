import type { TriagemType } from '@/types'
import api from './api'

export interface PaginatedTriagens {
  data: TriagemType[]
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export const fetchTriagens = async (params: {
  page: number
  per_page: number
}): Promise<PaginatedTriagens> => {
  const response = await api.get('triagem', {
    params: {
      page: params.page,
      per_page: params.per_page,
    },
  })
  return response.data
}

export const createTriagens = async (triagemData: TriagemType) => {
  const response = await api.post('triagem', triagemData)
  return response.data
}

export const updateTriagem = async ({
  triagem_id,
  ...data
}: TriagemType) => {
  const response = await api.put(`/triagem/${triagem_id}`, data)
  return response.data
}

export const deleteTriagem = async (id: string) => {
  const response = await api.delete(`/triagem/${id}`)
  return response.data
}
