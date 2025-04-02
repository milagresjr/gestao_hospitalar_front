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
import Badge from '@/components/ui_old/badge/Badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui_old/table'
import {
  type PaginatedTipoConsultas,
  createTipoConsulta,
  deleteTipoConsulta,
  fetchTipoConsulta,
  updateTipoConsulta,
} from '@/services/tipo-consulta'
import type { EspecialidadeType, TipoConsultaType } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { PaginationComponent } from '@/components/ui_old/pagination/Pagination'
import api from '@/services/api'
import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'

// Esquema de validação com Zod
const tipoConsultaSchema = z.object({
  nome: z.string().min(1, 'O nome é obrigatória'),
  descricao: z.string().min(1, 'A descrição é obrigatória'),
  especialidade_id: z.number().min(1, 'Indica a especialidade'),
  duracao: z.string(),
})

type TipoConsultaFormData = z.infer<typeof tipoConsultaSchema>

export default function TipoConsultasTable() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedTipoConsulta, setSelectedTipoConsulta] =
    useState<TipoConsultaType | null>(null)
  const [tipoConsultaToDelete, setTipoConsultaToDelete] =
    useState<TipoConsultaType | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const [especialidadesValue, setEspecialidadesValue] = useState<
    EspecialidadeType[]
  >([])

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
  } = useForm<TipoConsultaFormData>({
    resolver: zodResolver(tipoConsultaSchema),
  })

  const {
    data: paginatedData,
    isLoading,
    error,
  } = useQuery<PaginatedTipoConsultas>({
    queryKey: ['tipoConsultas', currentPage, itemsPerPage],
    queryFn: () =>
      fetchTipoConsulta({
        page: currentPage,
        per_page: itemsPerPage,
      }),
  })

  const queryClient = useQueryClient()

  const { mutateAsync: createTipoConsultaFn } = useMutation({
    mutationFn: createTipoConsulta,
    onSuccess: () => {
      // Invalidar todas as páginas
      queryClient.invalidateQueries({
        queryKey: ['tipoConsultas'],
        exact: false,
      })
    },
  })

  const { mutateAsync: updateTipoConsultaFn } = useMutation({
    mutationFn: updateTipoConsulta,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tipoConsultas'],
        exact: false, // Invalida TODAS as queries que começam com 'tipoConsultas'
      })
    },
  })

  const { mutateAsync: deleteTipoConsultaFn } = useMutation({
    mutationFn: deleteTipoConsulta,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tipoConsultas'],
        exact: false, // Invalida TODAS as queries que começam com 'tipoConsultas'
      })
    },
  })

  async function handleSubmitForm(data: TipoConsultaFormData) {
    try {
      if (selectedTipoConsulta) {
        await updateTipoConsultaFn({
          tipo_consulta_id: selectedTipoConsulta.tipo_consulta_id,
          ...data,
        })
      } else {
        await createTipoConsultaFn({
          descricao: data.descricao,
          nome: data.nome,
          especialidade_id: data.especialidade_id,
          duracao: data.duracao,
        })
      }
      setSelectedTipoConsulta(null)
      reset() // Limpa o formulário após o envio
      closeDialog()
    } catch (error) {
      console.log('Erro ao cadastrar/editar novo tipo de consulta', error)
    }
  }

  // Delete Handler
  async function handleDelete() {
    if (!tipoConsultaToDelete) return
    try {
      await deleteTipoConsultaFn(tipoConsultaToDelete.tipo_consulta_id)
      setTipoConsultaToDelete(null)
    } catch (error) {
      console.log('Erro ao excluir tipoConsulta')
    }
  }

  // Edit Handler
  function handleEdit(tipoConsulta: TipoConsultaType) {
    console.log('Dados do tipo de consulta', tipoConsulta)
    setSelectedTipoConsulta(tipoConsulta)
    setValue('nome', tipoConsulta.nome)
    setValue('especialidade_id', tipoConsulta.especialidade.especialidade_id)
    setValue('duracao', tipoConsulta.duracao)
    setValue('descricao', tipoConsulta.descricao)
    setIsDialogOpen(true)
  }

  useEffect(() => {
    // Chamada para buscar as especialidades da API
    api
      .get('especialidades')
      .then(response => {
        setEspecialidadesValue(response.data.data)
      })
      .catch(error => {
        console.error('Erro ao carregar especialidades:', error)
      })
  }, [])

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
                setSelectedTipoConsulta(null)
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
            <DialogContent className="sm:max-w-[425px] md:max-w-[500px]">
              <form onSubmit={handleSubmit(handleSubmitForm)}>
                <DialogHeader>
                  <DialogTitle>
                    {selectedTipoConsulta ? 'Editar Fármaco' : 'Novo Fármaco'}
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="nome" className="text-right">
                      Nome
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="nome"
                        {...register('nome')}
                        className={errors.nome && 'border-red-500'}
                      />
                      {errors.nome && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.nome.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="especialidade_id" className="text-right">
                      especialidade
                    </Label>
                    <div className="col-span-3">
                      <Select
                        value={watch('especialidade_id')?.toString() || ''}
                        onValueChange={value =>
                          setValue('especialidade_id', value.toString())
                        }
                      >
                        <SelectTrigger
                          className={`${errors.especialidade_id && 'border-red-500'} text-gray-400 dark:text-gray-300`}
                        >
                          <SelectValue placeholder="Selecione a especialidade" />
                        </SelectTrigger>
                        <SelectContent>
                          {especialidadesValue.map(
                            (especialidade: EspecialidadeType) => (
                              <SelectItem
                                key={especialidade.especialidade_id}
                                value={especialidade.especialidade_id.toString()}
                              >
                                {especialidade.nome}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      {errors.especialidade_id && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.especialidade_id.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="duracao" className="text-right">
                        Duração
                      </Label>
                      <div className="col-span-3">
                        <Input
                          id="duracao"
                          {...register('duracao')}
                          className={errors.duracao && 'border-red-500'}
                        />
                        {errors.duracao && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.duracao.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="descricao" className="text-right">
                        Descrição
                      </Label>
                      <div className="col-span-3">
                        <Textarea
                          id="descricao"
                          {...register('descricao')}
                          className={errors.descricao && 'border-red-500'}
                        />
                        {errors.descricao && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.descricao.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">
                    {selectedTipoConsulta ? 'Salvar Alterações' : 'Salvar'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Dialog de Confirmação de Exclusão */}
          <Dialog
            open={!!tipoConsultaToDelete}
            onOpenChange={open => !open && setTipoConsultaToDelete(null)}
          >
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Confirmar Exclusão</DialogTitle>
                <DialogDescription>
                  Tem certeza que deseja excluir esse tipo de consulta{' '}
                  {tipoConsultaToDelete?.descricao}?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setTipoConsultaToDelete(null)}
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
                    Nome
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-lg dark:text-gray-400"
                  >
                    Especialidade
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-lg dark:text-gray-400"
                  >
                    Duração
                  </TableCell>

                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-lg dark:text-gray-400"
                  >
                    Descrição
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {paginatedData?.data.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {item.nome}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {item.especialidade.nome}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {item.duracao}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {item.descricao}
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
                          onClick={() => setTipoConsultaToDelete(item)}
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
