import type { ResultadoExameType } from '@/types'
import api from './api'

export interface PaginatedResultadoExames {
  data: ResultadoExameType[]
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export const fetchResultadoExame = async (params: {
  page: number
  per_page: number
}): Promise<PaginatedResultadoExames> => {
  const response = await api.get('resultado-exames', {
    params: {
      page: params.page,
      per_page: params.per_page,
    },
  })
  return response.data
}

export const createResultadoExame = async (
  ResultadoExameData: ResultadoExameType
) => {
  const response = await api.post('resultado-exames', ResultadoExameData)
  return response.data
}

export const updateResultadoExame = async ({
  resultado_exame_id,
  ...data
}: ResultadoExameType) => {
  const response = await api.put(`resultado-exames/${resultado_exame_id}`, data)
  return response.data
}

export const deleteResultadoExame = async (id: string) => {
  const response = await api.delete(`resultado-exames/${id}`)
  return response.data
}
