import type { InternamentoType } from '@/types'
import api from './api'

export interface PaginatedInternamentos {
    data: InternamentoType[]
    current_page: number
    per_page: number
    total: number
    last_page: number
}

export const fetchInternamentos = async (params: {
    page: number
    per_page: number
}): Promise<PaginatedInternamentos> => {
    const response = await api.get('internamentos', {
        params: {
            page: params.page,
            per_page: params.per_page,
        },
    })
    console.log('resposta API', response.data)
    return response.data
}

export const createInternamento = async (internamentoData: InternamentoType) => {
    const response = await api.post('internamentos', internamentoData)
    return response.data
}

export const updateInternamento = async ({ internamento_id, ...data }: InternamentoType) => {
    const response = await api.put(`/internamentos/${internamento_id}`, data)
    return response.data
}

export const deleteInternamento = async (id: string) => {
    const response = await api.delete(`/internamentos/${id}`)
    return response.data
}
