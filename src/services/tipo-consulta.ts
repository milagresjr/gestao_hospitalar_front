import type { TipoConsultaType } from '@/types'
import api from './api'

export interface PaginatedTipoConsultas {
  data: TipoConsultaType[]
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export const fetchTipoConsulta = async (params: {
  page: number
  per_page: number
}): Promise<PaginatedTipoConsultas> => {
  const response = await api.get('tipo-consulta', {
    params: {
      page: params.page,
      per_page: params.per_page,
    },
  })
  return response.data
}

export const createTipoConsulta = async (
  tipoConsultaData: TipoConsultaType
) => {
  const response = await api.post('tipo-consulta', tipoConsultaData)
  return response.data
}

export const updateTipoConsulta = async ({
  tipo_consulta_id,
  ...data
}: TipoConsultaType) => {
  const response = await api.put(`tipo-consulta/${tipo_consulta_id}`, data)
  return response.data
}

export const deleteTipoConsulta = async (id: string) => {
  const response = await api.delete(`tipo-consulta/${id}`)
  return response.data
}
