import type { TipoServicoType } from '@/types'
import api from './api'

export interface PaginatedTipoServicos {
  data: TipoServicoType[]
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export const fetchTipoServicos = async (params: {
  page: number
  per_page: number
}): Promise<PaginatedTipoServicos> => {
  const response = await api.get('tipo-servico', {
    params: {
      page: params.page,
      per_page: params.per_page,
    },
  })
  console.log('Dados Dos Services: ', response.data)
  return response.data
}

export const createTipoServico = async (tipoServicoData: TipoServicoType) => {
  const response = await api.post('tipo-servico', tipoServicoData)
  return response.data
}

export const updateTipoServico = async ({
  tipo_servico_id,
  ...data
}: TipoServicoType) => {
  const response = await api.put(`tipo-servico/${tipo_servico_id}`, data)
  return response.data
}

export const deleteTipoServico = async (id: string) => {
  const response = await api.delete(`tipo-servico/${id}`)
  return response.data
}
