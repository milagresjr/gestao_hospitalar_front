import type { ProfissionalSaudeType } from '@/types'
import api from './api'

export interface PaginatedProfissionalSaude {
  data: ProfissionalSaudeType[]
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export const fetchProfissionalSaude = async (params: {
  page: number
  per_page: number
}): Promise<PaginatedProfissionalSaude> => {
  const response = await api.get('profissional-saude', {
    params: {
      page: params.page,
      per_page: params.per_page,
    },
  })
  return response.data
}

export const getProfissionalSaude = async () => {
  const response = await api.get('profissional-saude')
  return response.data
}

export const createProfissionalSaude = async (proffionalSaudeData: ProfissionalSaudeType) => {
  const response = await api.post('profissional-saude', proffionalSaudeData)
  return response.data
}

export const updateProfissionalSaude = async ({
  profissional_saude_id,
  ...data
}: ProfissionalSaudeType) => {
  const response = await api.put(`/profissional-saude/${profissional_saude_id}`, data)
  return response.data
}

export const deleteProfissionalSaude = async (id: string) => {
  const response = await api.delete(`/profissional-saude/${id}`)
  return response.data
}
