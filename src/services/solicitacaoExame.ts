import type { SolicitacaoExameType } from '@/types'
import api from './api'

export interface PaginatedSolicitacaoExames {
  data: SolicitacaoExameType[]
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export const fetchSolicitacaoExame = async (params: {
  page: number
  per_page: number
}): Promise<PaginatedSolicitacaoExames> => {
  const response = await api.get('solicitacao-exame', {
    params: {
      page: params.page,
      per_page: params.per_page,
    },
  })
  return response.data
}

export const createSolicitacaoExame = async (
  SolicitacaoExameData: SolicitacaoExameType
) => {
  const response = await api.post('solicitacao-exame', SolicitacaoExameData)
  return response.data
}

export const updateSolicitacaoExame = async ({
  solicitacao_exame_id,
  ...data
}: SolicitacaoExameType) => {
  const response = await api.put(`solicitacao-exame/${solicitacao_exame_id}`, data)
  return response.data
}

export const deleteSolicitacaoExame = async (id: string) => {
  const response = await api.delete(`solicitacao-exame/${id}`)
  return response.data
}
