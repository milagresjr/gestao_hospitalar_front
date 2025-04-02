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
  type PaginatedTipoServicos,
  createTipoServico,
  deleteTipoServico,
  fetchTipoServicos,
  updateTipoServico,
} from '@/services/tipo-servico'
import type { TipoServicoType } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { Textarea } from '@/components/ui/textarea'
import { PaginationComponent } from '@/components/ui_old/pagination/Pagination'

import { Plus } from 'lucide-react'
import { useState } from 'react'

// Esquema de validação com Zod
const tipoServicoSchema = z.object({
  nome: z.string().min(1, 'O nome é obrigatória'),
  descricao: z.string().min(1, 'A descrição é obrigatória'),
})

type TipoServicoFormData = z.infer<typeof tipoServicoSchema>

export default function TipoServicosTable() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedTipoServico, setSelectedTipoServico] =
    useState<TipoServicoType | null>(null)
  const [tipoServicoToDelete, setTipoServicoToDelete] =
    useState<TipoServicoType | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

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
  } = useForm<TipoServicoFormData>({
    resolver: zodResolver(tipoServicoSchema),
  })

  const {
    data: paginatedData,
    isLoading,
    error,
  } = useQuery<PaginatedTipoServicos>({
    queryKey: ['tipoServicos', currentPage, itemsPerPage],
    queryFn: () =>
      fetchTipoServicos({
        page: currentPage,
        per_page: itemsPerPage,
      }),
  })

  const queryClient = useQueryClient()

  const { mutateAsync: createTipoServicoFn } = useMutation({
    mutationFn: createTipoServico,
    onSuccess: () => {
      // Invalidar todas as páginas
      queryClient.invalidateQueries({
        queryKey: ['tipoServicos'],
        exact: false,
      })
    },
  })

  const { mutateAsync: updateTipoServicoFn } = useMutation({
    mutationFn: updateTipoServico,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tipoServicos'],
        exact: false, // Invalida TODAS as queries que começam com 'tipoServicos'
      })
    },
  })

  const { mutateAsync: deleteTipoServicoFn } = useMutation({
    mutationFn: deleteTipoServico,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tipoServicos'],
        exact: false, // Invalida TODAS as queries que começam com 'tipoServicos'
      })
    },
  })

  async function handleSubmitForm(data: TipoServicoFormData) {
    try {
      console.log('Nao entrou: ', selectedTipoServico)
      if (selectedTipoServico) {
        console.log('Pra editar: ', selectedTipoServico)
        await updateTipoServicoFn({
          tipo_servico_id: selectedTipoServico.tipo_servico_id,
          ...data,
        })
      } else {
        await createTipoServicoFn({
          descricao: data.descricao,
          nome: data.nome,
        })
      }
      setSelectedTipoServico(null)
      reset() // Limpa o formulário após o envio
      closeDialog()
    } catch (error) {
      console.log('Erro ao cadastrar/editar novo tipo de consulta', error)
    }
  }

  // Delete Handler
  async function handleDelete() {
    if (!tipoServicoToDelete) return
    try {
      await deleteTipoServicoFn(tipoServicoToDelete.tipo_servico_id)
      setTipoServicoToDelete(null)
    } catch (error) {
      console.log('Erro ao excluir tipoServico')
    }
  }

  // Edit Handler
  function handleEdit(tipoServico: TipoServicoType) {
    console.log('Dados do tipo de servico', tipoServico)
    setSelectedTipoServico(tipoServico)
    setValue('nome', tipoServico.nome)
    setValue('descricao', tipoServico.descricao)
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
                setSelectedTipoServico(null)
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
                    {selectedTipoServico ? 'Editar Fármaco' : 'Novo Fármaco'}
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

                  <div className="grid gap-4 py-4">
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
                    {selectedTipoServico ? 'Salvar Alterações' : 'Salvar'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Dialog de Confirmação de Exclusão */}
          <Dialog
            open={!!tipoServicoToDelete}
            onOpenChange={open => !open && setTipoServicoToDelete(null)}
          >
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Confirmar Exclusão</DialogTitle>
                <DialogDescription>
                  Tem certeza que deseja excluir esse tipo de serviço{' '}
                  {tipoServicoToDelete?.nome}?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setTipoServicoToDelete(null)}
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
                          onClick={() => setTipoServicoToDelete(item)}
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
