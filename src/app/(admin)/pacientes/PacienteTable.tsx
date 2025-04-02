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
  type PaginatedPacientes,
  alterEstadoPaciente,
  createPacientes,
  deletePaciente,
  fetchPacientes,
  updatePaciente,
} from '@/services/paciente'
import type { PacienteType, SalaType } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PaginationComponent } from '@/components/ui_old/pagination/Pagination'
import { Plus, RefreshCcw } from 'lucide-react'
import { useState } from 'react'
import { createTriagens } from '@/services/triagem'

// Esquema de validação com Zod
const pacienteSchema = z.object({
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
  grupo_sanguineo: z.string().min(1, 'Selecione um tipo sanguíneo válido'),
  // teste: z.string(),
})

type PacienteFormData = z.infer<typeof pacienteSchema>

export default function PacientesTable() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedPaciente, setSelectedPaciente] = useState<PacienteType | null>(
    null
  )
  const [pacienteToDelete, setPacienteToDelete] = useState<PacienteType | null>(
    null
  )
  const [pacienteToTriagem, setPacienteToTriagem] = useState<PacienteType | null>(
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
    watch,
  } = useForm<PacienteFormData>({
    resolver: zodResolver(pacienteSchema),
  })

  const {
    data: paginatedData,
    isLoading,
    error,
  } = useQuery<PaginatedPacientes>({
    queryKey: ['pacientes', currentPage, itemsPerPage],
    queryFn: () =>
      fetchPacientes({
        page: currentPage,
        per_page: itemsPerPage,
      }),
  })

  const queryClient = useQueryClient()

  const { mutateAsync: createPacienteFn } = useMutation({
    mutationFn: createPacientes,
    onSuccess: () => {
      // Invalidar todas as páginas
      queryClient.invalidateQueries({
        queryKey: ['pacientes'],
        exact: false,
      })
    },
  })

  const { mutateAsync: updatePacienteFn } = useMutation({
    mutationFn: updatePaciente,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['pacientes'],
        exact: false, // Invalida TODAS as queries que começam com 'pacientes'
      })
    },
  })

  const { mutateAsync: deletePacienteFn } = useMutation({
    mutationFn: deletePaciente,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['pacientes'],
        exact: false, // Invalida TODAS as queries que começam com 'pacientes'
      })
    },
  })

    const { mutateAsync: createTriagemFn } = useMutation({
    mutationFn: createTriagens,
    onSuccess: () => {
      // Invalidar todas as páginas
      queryClient.invalidateQueries({
        queryKey: ['triagens'],
        exact: false,
      })
    },
  })

  async function handleSubmitForm(data: PacienteFormData) {
    // console.log("testeee")
    // return
    try {
      if (selectedPaciente) {
        await updatePacienteFn({
          paciente_id: selectedPaciente.paciente_id,
          ...data,
        })
      } else {
        await createPacienteFn({
          nome: data.nome,
          telefone: data.telefone,
          email: data.email,
          sexo: data.sexo,
          endereco: data.endereco,
          data_nascimento: data.data_nascimento,
          grupo_sanguineo: data.grupo_sanguineo,
        })
      }
      setSelectedPaciente(null)
      reset() // Limpa o formulário após o envio
      closeDialog()
    } catch (error) {
      console.log('Erro ao cadastrar/editar nova paciente', error)
    }
  }

  // Delete Handler
  async function handleDelete() {
    if (!pacienteToDelete) return
    try {
      await deletePacienteFn(pacienteToDelete.paciente_id)
      setPacienteToDelete(null)
    } catch (error) {
      console.log('Erro ao excluir paciente',error)
    }
  }

    const { mutateAsync: alterarEstadoPacienteFn } = useMutation({
      mutationFn: alterEstadoPaciente,
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['pacientes'],
          exact: false, // Invalida TODAS as queries que começam com 'pacientes'
        })
      },
    })

  // Edit Handler
  function handleEdit(paciente: PacienteType) {
    console.log(paciente.sexo)
    setSelectedPaciente(paciente)
    setValue('nome', paciente.nome)
    setValue('email', paciente.email)
    setValue('telefone', paciente.telefone)
    setValue('sexo', paciente.sexo)
    setValue('endereco', paciente.endereco)
    setValue('data_nascimento', paciente.data_nascimento)
    setValue('grupo_sanguineo', paciente.grupo_sanguineo)
    setIsDialogOpen(true)
  }

  async function handleAlterarEstadoPacienteFn(statu: string, idPaciente: any = pacienteToTriagem?.paciente_id) {
    try {
        await alterarEstadoPacienteFn({
          paciente_id: idPaciente,
          status: statu,
        })
      } catch (error) {
        console.log('Erro ao enviar paciente para o consultorio',error)
      }
  }

  async function handleEviarPraTriagem() {
    try {
      await createTriagemFn({
        paciente_id: pacienteToTriagem?.paciente_id,
        temperatura: '',
        frequencia_cardiaca: '',
        frequencia_respiratoria: '',
        peso: '',
        tensao_arterial: '',
      })
      await handleAlterarEstadoPacienteFn('Triagem')
      console.log("Enviado com sucesso!")
      setPacienteToTriagem(null)
    } catch (error) {
      console.log("Erro ao enviar para triagem",error)
    }
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
                setSelectedPaciente(null)
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
                    {selectedPaciente ? 'Editar Paciente' : 'Novo Paciente'}
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
                          <SelectValue placeholder="Selecione a gênero" />
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
                    <Label htmlFor="grupo_sanguineo" className="text-right">
                      Grupo Sanguineo
                    </Label>
                    <div className="col-span-3">
                      <Select
                        value={watch('grupo_sanguineo')?.toString() || ''}
                        onValueChange={value =>
                          setValue('grupo_sanguineo', value.toString())
                        }
                      >
                        <SelectTrigger
                          className={`${errors.grupo_sanguineo && 'border-red-500'} text-gray-400 dark:text-gray-300`}
                        >
                          <SelectValue placeholder="Selecione o grupo sanguineo" />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            'A+',
                            'A-',
                            'B+',
                            'B-',
                            'AB+',
                            'AB-',
                            'O+',
                            'O-',
                          ].map(tipo => (
                            <SelectItem key={tipo} value={tipo}>
                              {tipo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.grupo_sanguineo && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.grupo_sanguineo.message}
                        </p>
                      )}
                    </div>
                  </div>

                  
                </div>
                <DialogFooter>
                  <Button type="submit">
                    {selectedPaciente ? 'Salvar Alterações' : 'Salvar'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Dialog de Confirmação de Exclusão */}
          <Dialog
            open={!!pacienteToDelete}
            onOpenChange={open => !open && setPacienteToDelete(null)}
          >
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Confirmar Exclusão</DialogTitle>
                <DialogDescription>
                  Tem certeza que deseja excluir a paciente{' '}
                  {pacienteToDelete?.nome}?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setPacienteToDelete(null)}
                >
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Confirmar Exclusão
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>


          
            {/* Dialog de Confirmação envio do paciente para triagem */}
            <Dialog
            open={!!pacienteToTriagem}
            onOpenChange={open => !open && setPacienteToTriagem(null)}
            >
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Confirmar Envio</DialogTitle>
                <DialogDescription>
                  Deseja enviar esse paciente para área de triagem?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setPacienteToTriagem(null)}
                >
                  Cancelar
                </Button>
                <Button variant="default" onClick={handleEviarPraTriagem}>
                  Sim
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
                    Grupo Sanguineo
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
                      {item.grupo_sanguineo}
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
                          onClick={() => setPacienteToDelete(item)}
                        >
                          Excluir
                        </Button>
                        <Button
                          size="sm"
                          className={`${item.status=='Aguardando atendimento' ? 'bg-green-600 hover:bg-green-500' : 'hidden'}`}
                          onClick={() => setPacienteToTriagem(item)}
                        >
                          Enviar pra triagem
                        </Button>
                        <Button
                          size="sm"
                          className={`${(item.status=='Finalizado' || item.status=='Alta') ? 'bg-purple-600 hover:bg-purple-500' : 'hidden'}`}
                          onClick={async () => await handleAlterarEstadoPacienteFn('Aguardando atendimento', item.paciente_id)}
                        >
                          <RefreshCcw />
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
