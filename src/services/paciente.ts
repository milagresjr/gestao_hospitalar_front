import type { PacienteType } from '@/types'
import api from './api'

export interface PaginatedPacientes {
  data: PacienteType[]
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export const fetchPacientes = async (params: {
  page: number
  per_page: number
  search?: string
}): Promise<PaginatedPacientes> => {
  const response = await api.get('pacientes', {
    params: {
      page: params.page,
      per_page: params.per_page,
      search: params.search
    },
  })
  return response.data
}

export const getPacientes = async () => {
  const response = await api.get('pacientes')
  return response.data
}

export const createPacientes = async (camaData: PacienteType) => {
  const response = await api.post('pacientes', camaData)
  return response.data
}

export const alterEstadoPaciente = async ({
  paciente_id,
  ...data
}: PacienteType) => {
  const response = await api.post(`paciente/alterar-status/${paciente_id}`, data)
  return response.data
}

export const updatePaciente = async ({
  paciente_id,
  ...data
}: PacienteType) => {
  const response = await api.put(`/pacientes/${paciente_id}`, data)
  return response.data
}

export const deletePaciente = async (id: string) => {
  const response = await api.delete(`/pacientes/${id}`)
  return response.data
}
