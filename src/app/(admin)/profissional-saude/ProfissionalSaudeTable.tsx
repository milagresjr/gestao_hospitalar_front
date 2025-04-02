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
  type PaginatedProfissionalSaude,
  createProfissionalSaude,
  deleteProfissionalSaude,
  fetchProfissionalSaude,
  updateProfissionalSaude,
} from '@/services/profissional-saude'
import type { ProfissionalSaudeType, SalaType } from '@/types'
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

// Esquema de validação com Zod
const profissionalSaudeSchema = z.object({
  nome: z.string().min(1, 'O nome é obrigatório'),
  email: z.string().email('E-mail inválido').nonempty('O e-mail é obrigatório'),
  telefone: z
    .string()
    .min(9, 'O telefone deve ter no mínimo 8 dígitos')
    .regex(/^\d+$/, 'O telefone deve conter apenas números'),
  endereco: z.string(),
  data_nascimento: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      'A data de nascimento deve estar no formato AAAA-MM-DD'
    ),
  sexo: z.string().min(1, 'Selecione um gênero válido'),
  tipo_profissional: z
    .string()
    .min(1, 'Selecione um tipo de profissional válido'),
})

type ProfissionalSaudeFormData = z.infer<typeof profissionalSaudeSchema>

export default function ProfissionalSaudeTable() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedProfissionalSaude, setSelectedProfissionalSaude] =
    useState<ProfissionalSaudeType | null>(null)
  const [profissionalSaudeToDelete, setProfissionalSaudeToDelete] =
    useState<ProfissionalSaudeType | null>(null)

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
  } = useForm<ProfissionalSaudeFormData>({
    resolver: zodResolver(profissionalSaudeSchema),
  })

  const {
    data: paginatedData,
    isLoading,
    error,
  } = useQuery<PaginatedProfissionalSaude>({
    queryKey: ['profissionalSaudes', currentPage, itemsPerPage],
    queryFn: () =>
      fetchProfissionalSaude({
        page: currentPage,
        per_page: itemsPerPage,
      }),
  })

  const queryClient = useQueryClient()

  const { mutateAsync: createProfissionalSaudeFn } = useMutation({
    mutationFn: createProfissionalSaude,
    onSuccess: () => {
      // Invalidar todas as páginas
      queryClient.invalidateQueries({
        queryKey: ['profissionalSaudes'],
        exact: false,
      })
    },
  })

  const { mutateAsync: updateProfissionalSaudeFn } = useMutation({
    mutationFn: updateProfissionalSaude,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['profissionalSaudes'],
        exact: false, // Invalida TODAS as queries que começam com 'profissionalSaudes'
      })
    },
  })

  const { mutateAsync: deleteProfissionalSaudeFn } = useMutation({
    mutationFn: deleteProfissionalSaude,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['profissionalSaudes'],
        exact: false, // Invalida TODAS as queries que começam com 'profissionalSaudes'
      })
    },
  })

  async function handleSubmitForm(data: ProfissionalSaudeFormData) {
    try {
      if (selectedProfissionalSaude) {
        await updateProfissionalSaudeFn({
          profissional_saude_id:
            selectedProfissionalSaude.profissional_saude_id,
          ...data,
        })
      } else {
        await createProfissionalSaudeFn({
          nome: data.nome,
          telefone: data.telefone,
          email: data.email,
          sexo: data.sexo,
          endereco: data.endereco,
          data_nascimento: data.data_nascimento,
          tipo_profissional: data.tipo_profissional,
        })
      }
      setSelectedProfissionalSaude(null)
      reset() // Limpa o formulário após o envio
      closeDialog()
    } catch (error) {
      console.log('Erro ao cadastrar/editar nova profissional de saude', error)
    }
  }

  // Delete Handler
  async function handleDelete() {
    if (!profissionalSaudeToDelete) return
    try {
      await deleteProfissionalSaudeFn(
        profissionalSaudeToDelete.profissional_saude_id
      )
      setProfissionalSaudeToDelete(null)
    } catch (error) {
      console.log('Erro ao excluir profissionalSaude')
    }
  }

  // Edit Handler
  function handleEdit(profissionalSaude: ProfissionalSaudeType) {
    setSelectedProfissionalSaude(profissionalSaude)
    setValue('nome', profissionalSaude.nome)
    setValue('email', profissionalSaude.email)
    setValue('telefone', profissionalSaude.telefone)
    setValue('sexo', profissionalSaude.sexo)
    setValue('endereco', profissionalSaude.endereco)
    setValue('data_nascimento', profissionalSaude.data_nascimento)
    setValue('tipo_profissional', profissionalSaude.tipo_profissional)
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
                setSelectedProfissionalSaude(null)
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
                    {selectedProfissionalSaude
                      ? 'Editar ProfissionalSaude'
                      : 'Novo ProfissionalSaude'}
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
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="email"
                        {...register('email')}
                        className={errors.email && 'border-red-500'}
                        type="email"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="telefone" className="text-right">
                      Telefone
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="telefone"
                        {...register('telefone')}
                        className={errors.telefone && 'border-red-500'}
                      />
                      {errors.telefone && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.telefone.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="sexo" className="text-right">
                      Gênero
                    </Label>
                    <div className="col-span-3">
                      <Select
                        value={watch('sexo')?.toString() || ''}
                        onValueChange={value =>
                          setValue('sexo', value.toString())
                        }
                      >
                        <SelectTrigger
                          className={`${errors.sexo && 'border-red-500'} text-gray-400 dark:text-gray-300`}
                          defaultValue={'M'}
                        >
                          <SelectValue placeholder="Selecione o gênero" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={'M'}>Masculino</SelectItem>
                          <SelectItem value={'F'}>Feminino</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.sexo && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.sexo.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="data_nascimento" className="text-right">
                      Data de Nascimento
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="data_nascimento"
                        {...register('data_nascimento')}
                        type="date"
                        className={errors.data_nascimento && 'border-red-500'}
                      />
                      {errors.data_nascimento && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.data_nascimento.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="endereco" className="text-right">
                      Endereço
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="endereco"
                        {...register('endereco')}
                        className={errors.endereco && 'border-red-500'}
                      />
                      {errors.endereco && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.endereco.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="tipo_profissional" className="text-right">
                      Tipo de profissional
                    </Label>
                    <div className="col-span-3">
                      <Select
                        value={watch('tipo_profissional')?.toString() || ''}
                        onValueChange={value =>
                          setValue('tipo_profissional', value.toString())
                        }
                      >
                        <SelectTrigger
                          className={`${errors.tipo_profissional && 'border-red-500'} text-gray-400 dark:text-gray-300`}
                        >
                          <SelectValue placeholder="Selecione o tipo de profissional" />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            'Médico',
                            'Enfermeiro',
                            'Cirurgião',
                            'Fisioterapeuta',
                            'Genicologista',
                            'Pediátra',
                            'Urologista',
                          ].map(tipo => (
                            <SelectItem key={tipo} value={tipo}>
                              {tipo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.tipo_profissional && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.tipo_profissional.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">
                    {selectedProfissionalSaude ? 'Salvar Alterações' : 'Salvar'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Dialog de Confirmação de Exclusão */}
          <Dialog
            open={!!profissionalSaudeToDelete}
            onOpenChange={open => !open && setProfissionalSaudeToDelete(null)}
          >
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Confirmar Exclusão</DialogTitle>
                <DialogDescription>
                  Tem certeza que deseja excluir a profissionalSaude{' '}
                  {profissionalSaudeToDelete?.nome}?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setProfissionalSaudeToDelete(null)}
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
                    Email
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-lg dark:text-gray-400"
                  >
                    Telefone
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-lg dark:text-gray-400"
                  >
                    Gênero
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-lg dark:text-gray-400"
                  >
                    Data de Nascimento
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-lg dark:text-gray-400"
                  >
                    Endereço
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-lg dark:text-gray-400"
                  >
                    Tipo de profissional
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
                      {item.email}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {item.telefone}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {item.sexo === 'M' ? 'Masculino' : 'Feminino'}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {item.data_nascimento}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {item.endereco}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {item.tipo_profissional}
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
                          onClick={() => setProfissionalSaudeToDelete(item)}
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
