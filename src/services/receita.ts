import type { ReceitaType } from '@/types'
import api from './api'

export interface PaginatedReceitas {
    data: ReceitaType[]
    current_page: number
    per_page: number
    total: number
    last_page: number
}

export const fetchReceitas = async (params: {
    page: number
    per_page: number
}): Promise<PaginatedReceitas> => {
    const response = await api.get('receitas', {
        params: {
            page: params.page,
            per_page: params.per_page,
        },
    })
    return response.data
}

export const receitasPorPaciente = async (idPaciente: string | number) => {
    const response = await api.get(`/paciente/${idPaciente}/receitas`)
    return response.data
}

export const receitasPorConsulta = async (idConsulta: string | number | undefined) => {
    const response = await api.get(`/consultas/${idConsulta}/receitas`)
    return response.data
}

export const createReceita = async (receitaData: ReceitaType) => {
    const response = await api.post('receitas', receitaData)
    return response.data
}

export const updateReceita = async ({
    receita_id,
    ...data
}: ReceitaType) => {
    const response = await api.put(`/receitas/${receita_id}`, data)
    return response.data
}

export const deleteReceita = async (id: string) => {
    const response = await api.delete(`/receitas/${id}`)
    return response.data
}
