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
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { PaginationComponent } from '@/components/ui_old/pagination/Pagination'
import api from '@/services/api'
import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import PacienteSelect from './PacienteSelect'

// Esquema de validação com Zod
const consultaSchema = z.object({
  // status: z.string(),
  data_consulta: z.string(),
  // regex(
  //   /^\d{4}-\d{2}-\d{2} \d{2}:\d{2},
  //   'A data e hora devem estar no formato YYYY-MM-DD HH:MM'
  // ),
  observacoes: z.string(),
  prioridade: z.string().min(1, 'Selecione a prioridade'),
  paciente_id: z.string(),
  profissional_saude_id: z.string(),
  tipo_consulta_id: z.string(),
  tipo_servico_id: z.string(),
})

type ConsultaFormData = z.infer<typeof consultaSchema>

// Função para buscar pacientes da API
async function fetchPacientes(query: string) {
  const response = await api(`pacientes?search=${query}`)
  return await response.data()
}

export default function ConsultasTable() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedConsulta, setSelectedConsulta] = useState<ConsultaType | null>(
    null
  )
  const [consultaToDelete, setConsultaToDelete] = useState<ConsultaType | null>(
    null
  )

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const [pacientes, setPacientes] = useState<PacienteType[]>([])
  const [tipoConsultas, setTipoConsultas] = useState<TipoConsultaType[]>([])
  const [tipoServicos, setTipoServicos] = useState<TipoServicoType[]>([])
  const [profissionalSaude, setProfissionalSaude] = useState<
    ProfissionalSaudeType[]
  >([])

  useEffect(() => {
    async function getPacientes() {
      const response = await api.get('pacientes')
      setPacientes(response.data.data)
    }
    async function getTipoconsultas() {
      const response = await api.get('tipo-consulta')
      setTipoConsultas(response.data.data)
    }
    async function getTipoServicos() {
      const response = await api.get('tipo-servico')
      setTipoServicos(response.data.data)
    }
    async function getProfiSaude() {
      const response = await api.get('profissional-saude')
      setProfissionalSaude(response.data.data)
    }
    getPacientes()
    getTipoconsultas()
    getTipoServicos()
    getProfiSaude()
  }, [])

  function openDialog() {
    setIsDialogOpen(true)
  }
  function closeDialog() {
    setIsDialogOpen(false)
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
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
    try {
      // console.log(data)
      // return
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
      closeDialog()
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
    const formattedDate = new Date(consulta.data_consulta).toISOString().slice(0, 16);
    setValue('observacoes', consulta.observacoes)
    setValue('tipo_consulta_id', consulta.tipo_consulta_id)
    setValue('tipo_servico_id', consulta.tipo_servico_id)
    setValue('paciente_id', consulta.paciente_id)
    setValue('prioridade', consulta.prioridade)
    setValue('data_consulta', formattedDate)
    setValue('profissional_saude_id', consulta.profissional_saude_id)
    setIsDialogOpen(true)
  }

  if (isLoading) return <p>Carregando...</p>
  if (error) {
    console.log('ERROS: ', error)
    return <p>Erro ao carregar os dados</p>
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="flex justify-end p-3">
         
          {/* Dialog de Criação/Edição */}
          <Dialog
            open={isDialogOpen}
            onOpenChange={open => {
              if (!open) {
                reset()
                setSelectedConsulta(null)
              }
              setIsDialogOpen(open)
            }}
          >
            <DialogTrigger asChild>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus />
                Novo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] md:max-w-[700px]">
              <form onSubmit={handleSubmit(handleSubmitForm)}>
                <DialogHeader>
                  <DialogTitle>
                    {selectedConsulta ? 'Editar Consulta' : 'Nova Consulta'}
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="paciente_id" className="text-right">
                      Paciente
                    </Label>
                    <div className="col-span-3">
                      <Select
                        value={watch('paciente_id')?.toString() || ''}
                        onValueChange={value =>
                          setValue('paciente_id', value.toString())
                        }
                      >
                        <SelectTrigger
                          className={`${errors.paciente_id && 'border-red-500'} text-gray-400 dark:text-gray-300`}
                          defaultValue={'M'}
                        >
                          <SelectValue placeholder="Selecione o paciente" />
                        </SelectTrigger>
                        <SelectContent>
                          {pacientes.map(item => (
                            <SelectItem
                              key={item.paciente_id}
                              value={item.paciente_id.toString()}
                            >
                              {item.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.paciente_id && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.paciente_id.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="data_consulta" className="text-right">
                      Data da Consulta
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="data_consulta"
                        {...register('data_consulta')}
                        className={errors.data_consulta && 'border-red-500'}
                        type="datetime-local"
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
                      <Select
                        value={watch('tipo_consulta_id')?.toString() || ''}
                        onValueChange={value =>
                          setValue('tipo_consulta_id', value.toString())
                        }
                      >
                        <SelectTrigger
                          className={`${errors.tipo_consulta_id && 'border-red-500'} text-gray-400 dark:text-gray-300`}
                          defaultValue={'M'}
                        >
                          <SelectValue placeholder="Selecione o tipo de consulta" />
                        </SelectTrigger>
                        <SelectContent>
                          {tipoConsultas.map(tipo => (
                            <SelectItem
                              key={tipo.tipo_consulta_id}
                              value={tipo.tipo_consulta_id?.toString()}
                            >
                              {tipo.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      <Select
                        value={watch('tipo_servico_id')?.toString() || ''}
                        onValueChange={value =>
                          setValue('tipo_servico_id', value.toString())
                        }
                      >
                        <SelectTrigger
                          className={`${errors.tipo_servico_id && 'border-red-500'} text-gray-400 dark:text-gray-300`}
                          defaultValue={'M'}
                        >
                          <SelectValue placeholder="Selecione a tipo de servico" />
                        </SelectTrigger>
                        <SelectContent>
                          {tipoServicos.map(tipo => (
                            <SelectItem
                              key={tipo.tipo_servico_id}
                              value={tipo.tipo_servico_id.toString()}
                            >
                              {tipo.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.tipo_servico_id && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.tipo_servico_id.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label
                      htmlFor="profissional_saude_id"
                      className="text-right"
                    >
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
                          <SelectValue placeholder="Selecione o Médico" />
                        </SelectTrigger>
                        <SelectContent>
                          {profissionalSaude.map(item => (
                            <SelectItem
                              key={item.profissional_saude_id}
                              value={item.profissional_saude_id.toString()}
                            >
                              {item.nome}
                            </SelectItem>
                          ))}
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
                <DialogFooter>
                  <Button type="submit">
                    {selectedConsulta ? 'Salvar Alterações' : 'Salvar'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Dialog de Confirmação de Exclusão */}
          <Dialog
            open={!!consultaToDelete}
            onOpenChange={open => !open && setConsultaToDelete(null)}
          >
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Confirmar Exclusão</DialogTitle>
                <DialogDescription>
                  Tem certeza que deseja excluir a consulta?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setConsultaToDelete(null)}
                >
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Confirmar Exclusão
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1102px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-lg dark:text-gray-400"
                  >
                    Paciente
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-lg dark:text-gray-400"
                  >
                    Tipo de Consulta
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-lg dark:text-gray-400"
                  >
                    Tipo de Serviço
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-lg dark:text-gray-400"
                  >
                    Data da Consulta
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-lg dark:text-gray-400"
                  >
                    Profissional de saúde (Médico)
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-lg dark:text-gray-400"
                  >
                    Estado
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {paginatedData?.data.map(item => (
                  <TableRow key={item.consulta_id}>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {item.paciente.nome}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {item.tipo_consulta.nome}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {item.tipo_servico.nome}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {item.data_consulta}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {item.profissional_saude.nome}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {item.status}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(item)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setConsultaToDelete(item)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Paginação */}
            {paginatedData && (
              <PaginationComponent
                currentPage={paginatedData.current_page}
                itemsPerPage={paginatedData.per_page}
                totalItems={paginatedData.total}
                lastPage={paginatedData.last_page}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={value => {
                  setCurrentPage(1)
                  setItemsPerPage(value)
                }}
              />
            )}
          </div>
        </div>
      </div>
    </>
  )
}
