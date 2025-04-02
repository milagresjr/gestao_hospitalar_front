import type { EspecialidadeType } from '@/types'
import api from './api'

export interface PaginatedEspecialidades {
  data: EspecialidadeType[]
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export const fetchEspecialidades = async (params: {
  page: number
  per_page: number
}): Promise<PaginatedEspecialidades> => {
  const response = await api.get('especialidades', {
    params: {
      page: params.page,
      per_page: params.per_page,
    },
  })
  return response.data
}

export const createEspecialidade = async (
  especialidadeData: EspecialidadeType
) => {
  const response = await api.post('especialidades', especialidadeData)
  return response.data
}

export const updateEspecialidade = async ({
  especialidade_id,
  ...data
}: EspecialidadeType) => {
  const response = await api.put(`/especialidades/${especialidade_id}`, data)
  return response.data
}

export const deleteEspecialidade = async (id: string) => {
  const response = await api.delete(`/especialidades/${id}`)
  return response.data
}
