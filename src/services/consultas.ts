import type { ConsultaType } from '@/types'
import api from './api'

export interface PaginatedConsultas {
  data: ConsultaType[]
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export const fetchConsultas = async (params: {
  page: number
  per_page: number
}): Promise<PaginatedConsultas> => {
  const response = await api.get('consultas', {
    params: {
      page: params.page,
      per_page: params.per_page,
    },
  })
  return response.data
}

export const getTipoConsultas = async (tipo: string) => {
  const response = await api.get(`tipo-de-consultas?tipo=${tipo}`)
  return response.data
}

export const consultasPorPaciente = async (idPaciente: string | number) => {
  const response = await api.get(`/paciente/${idPaciente}/consultas`)
  return response.data
}

export const examesByConsulta = async (idConsulta: string | number | undefined) => {
  const response = await api.get(`/consultas/${idConsulta}/exames`)
  return response.data
}

export const createConsulta = async (consultaData: ConsultaType) => {
  const response = await api.post('consultas', consultaData)
  return response.data
}

export const updateConsulta = async ({
  consulta_id,
  ...data
}: ConsultaType) => {
  const response = await api.put(`/consultas/${consulta_id}`, data)
  return response.data
}

export const deleteConsulta = async (id: string) => {
  const response = await api.delete(`/consultas/${id}`)
  return response.data
}
