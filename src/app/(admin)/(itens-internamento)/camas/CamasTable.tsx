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
import Badge from '@/components/ui_old/badge/Badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui_old/table'
import {
  type PaginatedCamas,
  createCamas,
  deleteCama,
  fetchCamas,
  updateCama,
} from '@/services/camas'
import type { CamaType, SalaType } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PaginationComponent } from '@/components/ui_old/pagination/Pagination'
import api from '@/services/api'
import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'

// Esquema de validação com Zod
const camaSchema = z.object({
  descricao: z.string().min(1, 'A descrição é obrigatória'),
  sala_id: z.string(),
})

type CamaFormData = z.infer<typeof camaSchema>

export default function CamasTable() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCama, setSelectedCama] = useState<CamaType | null>(null)
  const [camaToDelete, setCamaToDelete] = useState<CamaType | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const [salasValue, setSalasValue] = useState<SalaType[]>([])

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
  } = useForm<CamaFormData>({
    resolver: zodResolver(camaSchema),
  })

  const {
    data: paginatedData,
    isLoading,
    error,
  } = useQuery<PaginatedCamas>({
    queryKey: ['camas', currentPage, itemsPerPage],
    queryFn: () =>
      fetchCamas({
        page: currentPage,
        per_page: itemsPerPage,
      }),
  })

  const queryClient = useQueryClient()

  const { mutateAsync: createCamaFn } = useMutation({
    mutationFn: createCamas,
    onSuccess: () => {
      // Invalidar todas as páginas
      queryClient.invalidateQueries({
        queryKey: ['camas'],
        exact: false,
      })
    },
  })

  const { mutateAsync: updateCamaFn } = useMutation({
    mutationFn: updateCama,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['camas'],
        exact: false, // Invalida TODAS as queries que começam com 'camas'
      })
    },
  })

  const { mutateAsync: deleteCamaFn } = useMutation({
    mutationFn: deleteCama,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['camas'],
        exact: false, // Invalida TODAS as queries que começam com 'camas'
      })
    },
  })

  async function handleSubmitForm(data: CamaFormData) {
    try {
      if (selectedCama) {
        console.log('Dados: ', selectedCama)
        await updateCamaFn({ cama_id: selectedCama.cama_id, ...data })
      } else {
        await createCamaFn({
          descricao: data.descricao,
          sala_id: data.sala_id,
          estado: '0',
        })
      }
      setSelectedCama(null)
      reset() // Limpa o formulário após o envio
      closeDialog()
    } catch (error) {
      console.log('Erro ao cadastrar/editar nova cama', error)
    }
  }

  // Delete Handler
  async function handleDelete() {
    if (!camaToDelete) return
    try {
      await deleteCamaFn(camaToDelete.cama_id)
      setCamaToDelete(null)
    } catch (error) {
      console.log('Erro ao excluir cama')
    }
  }

  // Edit Handler
  function handleEdit(cama: CamaType) {
    setSelectedCama(cama)
    setValue('descricao', cama.descricao)
    setValue('sala_id', cama.sala_id)
    setIsDialogOpen(true)
  }

  useEffect(() => {
    // Chamada para buscar as salas da API
    api
      .get('salas')
      .then(response => {
        setSalasValue(response.data.data)
      })
      .catch(error => {
        console.error('Erro ao carregar as salas:', error)
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
          {/* <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={openDialog}>
                                <Plus />
                                Novo
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <form onSubmit={handleSubmit(handleCreateCama)}>
                                <DialogHeader>
                                    <DialogTitle>Nova Cama</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="descricao" className="text-right">
                                            Descrição
                                        </Label>
                                        <div className="col-span-3">
                                            <Input
                                                id="descricao"
                                                {...register("descricao")}
                                                className={errors.descricao && "border-red-500"}
                                            />
                                            {errors.descricao && (
                                                <p className="text-red-500 text-sm mt-1">
                                                    {errors.descricao.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit">Salvar</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog> */}
          {/* Dialog de Criação/Edição */}
          <Dialog
            open={isDialogOpen}
            onOpenChange={open => {
              if (!open) {
                reset()
                setSelectedCama(null)
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
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleSubmit(handleSubmitForm)}>
                <DialogHeader>
                  <DialogTitle>
                    {selectedCama ? 'Editar Cama' : 'Nova Cama'}
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="descricao" className="text-right">
                      Descrição
                    </Label>
                    <div className="col-span-3">
                      <Input
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

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="sala_id" className="text-right">
                      Sala
                    </Label>
                    <div className="col-span-3">
                      <Select
                        value={watch('sala_id')?.toString() || ''}
                        onValueChange={value =>
                          setValue('sala_id', value.toString())
                        }
                      >
                        <SelectTrigger
                          className={`${errors.sala_id && 'border-red-500'} text-gray-400 dark:text-gray-300`}
                        >
                          <SelectValue placeholder="Selecione a sala" />
                        </SelectTrigger>
                        <SelectContent>
                          {salasValue.map((sala: SalaType) => (
                            <SelectItem
                              key={sala.sala_id}
                              value={sala.sala_id.toString()}
                            >
                              {sala.descricao}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.sala_id && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.sala_id.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">
                    {selectedCama ? 'Salvar Alterações' : 'Salvar'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Dialog de Confirmação de Exclusão */}
          <Dialog
            open={!!camaToDelete}
            onOpenChange={open => !open && setCamaToDelete(null)}
          >
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Confirmar Exclusão</DialogTitle>
                <DialogDescription>
                  Tem certeza que deseja excluir a cama{' '}
                  {camaToDelete?.descricao}?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCamaToDelete(null)}>
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
                    Descrição
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-lg dark:text-gray-400"
                  >
                    Sala
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
                {paginatedData?.data.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {item.descricao}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {item.sala?.descricao}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <Badge
                        size="sm"
                        color={item.estado ? 'success' : 'error'}
                      >
                        {item.estado == '0' ? 'Active' : 'Inactive'}
                      </Badge>
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
                          onClick={() => setCamaToDelete(item)}
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
