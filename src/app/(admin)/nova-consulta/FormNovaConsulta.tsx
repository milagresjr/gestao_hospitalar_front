'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui_old/table'
import {
  type PaginatedConsultas,
  createConsulta,
  deleteConsulta,
  fetchConsultas,
  updateConsulta,
} from '@/services/consultas'
import type {
  ConsultaType,
  PacienteType,
  ProfissionalSaudeType,
  TipoConsultaType,
  TipoServicoType,
} from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { PaginationComponent } from '@/components/ui_old/pagination/Pagination'
import api from '@/services/api'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import PacienteSelect from '../consultas/PacienteSelect'

// Esquema de validação com Zod
const consultaSchema = z.object({
  status: z.string(),
  data_consulta: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/,
      'A data e hora devem estar no formato YYYY-MM-DD HH:MM:SS'
    ),
  observacoes: z.string(),
  prioridade: z.string().min(1, 'Selecione a prioridade'),
  paciente_id: z.number(),
  profissional_saude_id: z.string().min(1, 'Selecione a profissional de saúde'),
  tipo_consulta_id: z.string().min(1, 'Selecione o tipo de consulta'),
  tipo_servico_id: z.string().min(1, 'Selecione o tipo de serviço'),
})

type ConsultaFormData = z.infer<typeof consultaSchema>

// Função para buscar pacientes da API
async function fetchPacientes(query: string) {
  const response = await api(`pacientes?search=${query}`)
  return await response.data()
}

export default function FormNovaConsulta() {
  const [selectedConsulta, setSelectedConsulta] = useState<ConsultaType | null>(
    null
  )
  const [consultaToDelete, setConsultaToDelete] = useState<ConsultaType | null>(
    null
  )

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    control,
  } = useForm<ConsultaFormData>({
    resolver: zodResolver(consultaSchema),
  })

  const {
    data: paginatedData,
    isLoading,
    error,
  } = useQuery<PaginatedConsultas>({
    queryKey: ['consultas', currentPage, itemsPerPage],
    queryFn: () =>
      fetchConsultas({
        page: currentPage,
        per_page: itemsPerPage,
      }),
  })

  const queryClient = useQueryClient()

  const { mutateAsync: createConsultaFn } = useMutation({
    mutationFn: createConsulta,
    onSuccess: () => {
      // Invalidar todas as páginas
      queryClient.invalidateQueries({
        queryKey: ['consultas'],
        exact: false,
      })
    },
  })

  const { mutateAsync: updateConsultaFn } = useMutation({
    mutationFn: updateConsulta,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['consultas'],
        exact: false, // Invalida TODAS as queries que começam com 'consultas'
      })
    },
  })

  const { mutateAsync: deleteConsultaFn } = useMutation({
    mutationFn: deleteConsulta,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['consultas'],
        exact: false, // Invalida TODAS as queries que começam com 'consultas'
      })
    },
  })

  async function handleSubmitForm(data: ConsultaFormData) {
    console.log(data)
    try {
      if (selectedConsulta) {
        await updateConsultaFn({
          consulta_id: selectedConsulta.consulta_id,
          ...data,
        })
      } else {
        await createConsultaFn({
          observacoes: data.observacoes,
          tipo_consulta_id: data.tipo_consulta_id,
          tipo_servico_id: data.tipo_servico_id,
          paciente_id: data.paciente_id,
          prioridade: data.prioridade,
          data_consulta: data.data_consulta,
          profissional_saude_id: data.profissional_saude_id,
        })
      }
      setSelectedConsulta(null)
      reset() // Limpa o formulário após o envio
      //   closeDialog()
    } catch (error) {
      console.log('Erro ao cadastrar/editar nova consulta', error)
    }
  }

  // Delete Handler
  async function handleDelete() {
    if (!consultaToDelete) return
    try {
      await deleteConsultaFn(consultaToDelete.consulta_id)
      setConsultaToDelete(null)
    } catch (error) {
      console.log('Erro ao excluir consulta')
    }
  }

  // Edit Handler
  function handleEdit(consulta: ConsultaType) {
    setSelectedConsulta(consulta)
    setValue('observacoes', consulta.observacoes)
    setValue('tipo_consulta_id', consulta.tipo_consulta_id)
    setValue('tipo_servico_id', consulta.tipo_servico_id)
    setValue('paciente_id', consulta.paciente_id)
    setValue('prioridade', consulta.prioridade)
    setValue('data_consulta', consulta.data_nascimento)
    setValue('profissional_saude_id', consulta.profissional_saude_id)
    // setIsDialogOpen(true)
  }

  return (
    <>
      <form onSubmit={handleSubmit(handleSubmitForm)}>
        {selectedConsulta ? 'Editar Consulta' : 'Nova Consulta'}

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="paciente_id" className="text-right">
              Paciente
            </Label>
            <div className="col-span-3">
              <Controller
                name="paciente_id"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <PacienteSelect
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.paciente_id && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.paciente_id.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="data_consulta" className="text-right">
              Data de Consulta
            </Label>
            <div className="col-span-3">
              <Input
                id="data_consulta"
                {...register('data_consulta')}
                className={errors.data_consulta && 'border-red-500'}
                type="data_consulta"
              />
              {errors.data_consulta && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.data_consulta.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tipo_consulta_id" className="text-right">
              Tipo de Consulta
            </Label>
            <div className="col-span-3">
              <Input
                id="tipo_consulta_id"
                {...register('tipo_consulta_id')}
                className={errors.tipo_consulta_id && 'border-red-500'}
              />
              {errors.tipo_consulta_id && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.tipo_consulta_id.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="prioridade" className="text-right">
              Prioridade
            </Label>
            <div className="col-span-3">
              <Select
                value={watch('prioridade')?.toString() || ''}
                onValueChange={value =>
                  setValue('prioridade', value.toString())
                }
              >
                <SelectTrigger
                  className={`${errors.prioridade && 'border-red-500'} text-gray-400 dark:text-gray-300`}
                  defaultValue={'M'}
                >
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    'EMERGÊNCIA',
                    'URGENTE',
                    'MUITO URGENTE',
                    'NÃO URGENTE',
                    'POUCO URGENTE',
                  ].map(tipo => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.prioridade && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.prioridade.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tipo_servico_id" className="text-right">
              Tipo de Serviço
            </Label>
            <div className="col-span-3">
              <Input
                id="tipo_servico_id"
                {...register('tipo_servico_id')}
                className={errors.tipo_servico_id && 'border-red-500'}
              />
              {errors.tipo_servico_id && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.tipo_servico_id.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="profissional_saude_id" className="text-right">
              Profissional de Saúde (Médico)
            </Label>
            <div className="col-span-3">
              <Select
                value={watch('profissional_saude_id')?.toString() || ''}
                onValueChange={value =>
                  setValue('profissional_saude_id', value.toString())
                }
              >
                <SelectTrigger
                  className={`${errors.profissional_saude_id && 'border-red-500'} text-gray-400 dark:text-gray-300`}
                >
                  <SelectValue placeholder="Selecione a sala" />
                </SelectTrigger>
                <SelectContent>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(
                    tipo => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              {errors.profissional_saude_id && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.profissional_saude_id.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="observacoes" className="text-right">
              Observações
            </Label>
            <div className="col-span-3">
              <Textarea
                id="observacoes"
                {...register('observacoes')}
                className={errors.observacoes && 'border-red-500'}
              />
              {errors.observacoes && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.observacoes.message}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit">
            {selectedConsulta ? 'Salvar Alterações' : 'Salvar'}
          </Button>
        </div>
      </form>
    </>
  )
}
