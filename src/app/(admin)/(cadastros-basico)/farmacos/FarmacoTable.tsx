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
  type PaginatedFarmacos,
  createFarmaco,
  deleteFarmaco,
  fetchFarmacos,
  updateFarmaco,
} from '@/services/farmaco'
import type { FarmacoType } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PaginationComponent } from '@/components/ui_old/pagination/Pagination'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

// Esquema de validação com Zod
const farmacoSchema = z.object({
  nome: z.string().min(1, 'O nome é obrigatória'),
  descricao: z.string().min(1, 'A descrição é obrigatória'),
  dosagem: z.string(),
  validade: z.string().date(),
  forma_farmaceutica: z.string().min(1, 'A forma farmacêutica é obrigatório'),
  estoque: z.string(),
})

type FarmacoFormData = z.infer<typeof farmacoSchema>

export default function FarmacosTable() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedFarmaco, setSelectedFarmaco] = useState<FarmacoType | null>(
    null
  )
  const [farmacoToDelete, setFarmacoToDelete] = useState<FarmacoType | null>(
    null
  )

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
  } = useForm<FarmacoFormData>({
    resolver: zodResolver(farmacoSchema),
  })

  const {
    data: paginatedData,
    isLoading,
    error,
  } = useQuery<PaginatedFarmacos>({
    queryKey: ['farmacos', currentPage, itemsPerPage],
    queryFn: () =>
      fetchFarmacos({
        page: currentPage,
        per_page: itemsPerPage,
      }),
  })

  const queryClient = useQueryClient()

  const { mutateAsync: createFarmacoFn } = useMutation({
    mutationFn: createFarmaco,
    onSuccess: () => {
      // Invalidar todas as páginas
      queryClient.invalidateQueries({
        queryKey: ['farmacos'],
        exact: false,
      })
    },
  })

  const { mutateAsync: updateFarmacoFn } = useMutation({
    mutationFn: updateFarmaco,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['farmacos'],
        exact: false, // Invalida TODAS as queries que começam com 'farmacos'
      })
    },
  })

  const { mutateAsync: deleteFarmacoFn } = useMutation({
    mutationFn: deleteFarmaco,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['farmacos'],
        exact: false, // Invalida TODAS as queries que começam com 'farmacos'
      })
    },
  })

  async function handleSubmitForm(data: FarmacoFormData) {
    try {
      if (selectedFarmaco) {
        await updateFarmacoFn({
          farmaco_id: selectedFarmaco.farmaco_id,
          ...data,
        })
      } else {
        await createFarmacoFn({
          descricao: data.descricao,
          nome: data.nome,
          dosagem: data.dosagem,
          forma_farmaceutica: data.forma_farmaceutica,
          estoque: data.estoque,
          validade: data.validade,
        })
      }
      setSelectedFarmaco(null)
      reset() // Limpa o formulário após o envio
      closeDialog()
    } catch (error) {
      console.log('Erro ao cadastrar/editar nova farmaco', error)
    }
  }

  // Delete Handler
  async function handleDelete() {
    if (!farmacoToDelete) return
    try {
      await deleteFarmacoFn(farmacoToDelete.farmaco_id)
      setFarmacoToDelete(null)
    } catch (error) {
      console.log('Erro ao excluir farmaco')
    }
  }

  // Edit Handler
  function handleEdit(farmaco: FarmacoType) {
    setSelectedFarmaco(farmaco)
    setValue('nome', farmaco.nome)
    setValue('dosagem', farmaco.dosagem)
    setValue('forma_farmaceutica', farmaco.forma_farmaceutica)
    setValue('validade', farmaco.validade)
    setValue('estoque', farmaco.estoque)
    setValue('descricao', farmaco.descricao)
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
                setSelectedFarmaco(null)
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
                    {selectedFarmaco ? 'Editar Fármaco' : 'Novo Fármaco'}
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
                    <Label htmlFor="forma_farmaceutica" className="text-right">
                      Forma Farmacêutica
                    </Label>
                    <div className="col-span-3">
                      <Select
                        onValueChange={value =>
                          setValue('forma_farmaceutica', value)
                        }
                        defaultValue=""
                      >
                        <SelectTrigger
                          className={
                            `${errors.forma_farmaceutica && 'border-red-500'} text-gray-400 dark:text-gray-300`
                           }
                        >
                          <SelectValue placeholder="Selecione a forma farmacêutica" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="comprimido">Comprimido</SelectItem>
                          <SelectItem value="capsula">Cápsula</SelectItem>
                          <SelectItem value="xarope">Xarope</SelectItem>
                          <SelectItem value="pomada">Pomada</SelectItem>
                          <SelectItem value="injecao">Injeção</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.forma_farmaceutica && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.forma_farmaceutica.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="dosagem" className="text-right">
                      Dosagem
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="dosagem"
                        {...register('dosagem')}
                        className={errors.dosagem && 'border-red-500'}
                      />
                      {errors.dosagem && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.dosagem.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="validade" className="text-right">
                      Validade
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="validade"
                        {...register('validade')}
                        className={errors.validade && 'border-red-500'}
                        type="date"
                      />
                      {errors.validade && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.validade.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="estoque" className="text-right">
                      Estoque
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="estoque"
                        {...register('estoque')}
                        className={errors.estoque && 'border-red-500'}
                        type="number"
                      />
                      {errors.estoque && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.estoque.message}
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
                    {selectedFarmaco ? 'Salvar Alterações' : 'Salvar'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Dialog de Confirmação de Exclusão */}
          <Dialog
            open={!!farmacoToDelete}
            onOpenChange={open => !open && setFarmacoToDelete(null)}
          >
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Confirmar Exclusão</DialogTitle>
                <DialogDescription>
                  Tem certeza que deseja excluir a farmaco{' '}
                  {farmacoToDelete?.descricao}?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setFarmacoToDelete(null)}
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
                    Dosagem
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-lg dark:text-gray-400"
                  >
                    Forma Farmacêutica
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-lg dark:text-gray-400"
                  >
                    Validade
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-lg dark:text-gray-400"
                  >
                    Estoque
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
                      {item.dosagem}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {item.forma_farmaceutica}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {item.validade}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {item.estoque}
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
                          onClick={() => setFarmacoToDelete(item)}
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
