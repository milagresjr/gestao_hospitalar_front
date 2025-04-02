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
  type PaginatedEspecialidades,
  createEspecialidade,
  deleteEspecialidade,
  fetchEspecialidades,
  updateEspecialidade,
} from '@/services/especialidade'
import type { EspecialidadeType } from '@/types'
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
const especialidadeSchema = z.object({
  nome: z.string().min(1, 'O nome é obrigatório'),
  descricao: z.string(),
})

type EspecialidadeFormData = z.infer<typeof especialidadeSchema>

export default function EspecialidadesTable() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedEspecialidade, setSelectedEspecialidade] =
    useState<EspecialidadeType | null>(null)
  const [especialidadeToDelete, setEspecialidadeToDelete] =
    useState<EspecialidadeType | null>(null)

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
  } = useForm<EspecialidadeFormData>({
    resolver: zodResolver(especialidadeSchema),
  })

  const {
    data: paginatedData,
    isLoading,
    error,
  } = useQuery<PaginatedEspecialidades>({
    queryKey: ['especialidades', currentPage, itemsPerPage],
    queryFn: () =>
      fetchEspecialidades({
        page: currentPage,
        per_page: itemsPerPage,
      }),
  })

  const queryClient = useQueryClient()

  const { mutateAsync: createEspecialidadeFn } = useMutation({
    mutationFn: createEspecialidade,
    onSuccess: () => {
      // Invalidar todas as páginas
      queryClient.invalidateQueries({
        queryKey: ['especialidades'],
        exact: false,
      })
    },
  })

  const { mutateAsync: updateEspecialidadeFn } = useMutation({
    mutationFn: updateEspecialidade,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['especialidades'],
        exact: false, // Invalida TODAS as queries que começam com 'especialidades'
      })
    },
  })

  const { mutateAsync: deleteEspecialidadeFn } = useMutation({
    mutationFn: deleteEspecialidade,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['especialidades'],
        exact: false, // Invalida TODAS as queries que começam com 'especialidades'
      })
    },
  })

  async function handleSubmitForm(data: EspecialidadeFormData) {
    try {
      if (selectedEspecialidade) {
        console.log('Dados: ', selectedEspecialidade)
        await updateEspecialidadeFn({
          especialidade_id: selectedEspecialidade.especialidade_id,
          ...data,
        })
      } else {
        await createEspecialidadeFn({
          nome: data.nome,
          descricao: data.descricao,
        })
      }
      setSelectedEspecialidade(null)
      reset() // Limpa o formulário após o envio
      closeDialog()
    } catch (error) {
      console.log('Erro ao cadastrar/editar nova especialidade', error)
    }
  }

  // Delete Handler
  async function handleDelete() {
    if (!especialidadeToDelete) return
    try {
      await deleteEspecialidadeFn(especialidadeToDelete.especialidade_id)
      setEspecialidadeToDelete(null)
    } catch (error) {
      console.log('Erro ao excluir especialidade')
    }
  }

  // Edit Handler
  function handleEdit(especialidade: EspecialidadeType) {
    setSelectedEspecialidade(especialidade)
    setValue('nome', especialidade.nome)
    setValue('descricao', especialidade.descricao)
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
                setSelectedEspecialidade(null)
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
                    {selectedEspecialidade
                      ? 'Editar Especialidade'
                      : 'Nova Especialidade'}
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
                <DialogFooter>
                  <Button type="submit">
                    {selectedEspecialidade ? 'Salvar Alterações' : 'Salvar'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Dialog de Confirmação de Exclusão */}
          <Dialog
            open={!!especialidadeToDelete}
            onOpenChange={open => !open && setEspecialidadeToDelete(null)}
          >
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Confirmar Exclusão</DialogTitle>
                <DialogDescription>
                  Tem certeza que deseja excluir a especialidade{' '}
                  {especialidadeToDelete?.descricao}?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setEspecialidadeToDelete(null)}
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
                      {item.nome}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {item.descricao}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <Badge size="sm" color={item.ativo ? 'success' : 'error'}>
                        {item.ativo == '1' ? 'Active' : 'Inactive'}
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
                          onClick={() => setEspecialidadeToDelete(item)}
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
