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
  type PaginatedTriagens,
  createTriagens,
  deleteTriagem,
  fetchTriagens,
  updateTriagem,
} from '@/services/triagem'
import type { TriagemType, SalaType, ProfissionalSaudeType, TipoConsultaType, TipoServicoType } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PaginationComponent } from '@/components/ui_old/pagination/Pagination'
import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { calcIdade } from '@/utils'
import api from '@/services/api'
import Badge from '@/components/ui_old/badge/Badge'
import { Textarea } from '@/components/ui/textarea'
import { createConsulta } from '@/services/consultas'
import { alterEstadoPaciente } from '@/services/paciente'

// Esquema de validação com Zod
const triagemSchema = z.object({
  // paciente_id: z.string(),
  temperatura: z.string(),
  tensao_arterial: z.string(),
  peso: z.string(),
  frequencia_respiratoria: z.string(),
  frequencia_cardiaca: z.string(),
  // especialidade: z.string(),
  profissional_saude: z.string(),
})

// Esquema de validação com Zod
const consultaSchema = z.object({
  data_consulta: z.string(),
  observacoes: z.string(),
  prioridade: z.string().min(1, 'Selecione a prioridade'),
  // paciente_id: z.string(),
  profissional_saude_id: z.string(),
  tipo_consulta_id: z.string(),
  tipo_servico_id: z.string(),
})

type TriagemFormData = z.infer<typeof triagemSchema>

type ConsultaformData = z.infer<typeof consultaSchema>

export default function TriagemTable() {

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDialogConsultaOpen, setIsDialogConsultaOpen] = useState(false)
  const [selectedTriagem, setSelectedTriagem] = useState<TriagemType | null>(
    null
  )
  const [triagemToConsultorio, setTriagemToConsultorio] = useState<TriagemType | null>(
    null
  )

  const [isConsultaNaHora,setIsConsultaNaHora] = useState(false)
  
    const [tipoConsultas, setTipoConsultas] = useState<TipoConsultaType[]>([])
    const [tipoServicos, setTipoServicos] = useState<TipoServicoType[]>([])

    const [profissionalSaude, setProfissionalSaude] = useState<
        ProfissionalSaudeType[]
    >([])

    
  useEffect(() => {
    async function getProfiSaude() {
      const response = await api.get('profissional-saude')
      setProfissionalSaude(response.data.data)
    }
    async function getTipoconsultas() {
      const response = await api.get('tipo-consulta')
      setTipoConsultas(response.data.data)
    }
    async function getTipoServicos() {
      const response = await api.get('tipo-servico')
      setTipoServicos(response.data.data)
    }
    getTipoconsultas()
    getTipoServicos()
    getProfiSaude()
  }, [])

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)


  function closeDialog() {
    setIsDialogOpen(false)
  }

  function closeDialogConsulta() {
    setIsDialogConsultaOpen(false)
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<TriagemFormData>({
    resolver: zodResolver(triagemSchema),
  })

  const {
    register: registerConsulta,
    handleSubmit: handleSubmitConsulta,
    formState: { errors: errorsConsulta },
    reset: resetConsulta,
    setValue: setValueConsulta,
    watch: watchConsulta,
  } = useForm<ConsultaformData>({
    resolver: zodResolver(consultaSchema),
  })

  const {
    data: paginatedData,
    isLoading,
    error,
  } = useQuery<PaginatedTriagens>({
    queryKey: ['triagens', currentPage, itemsPerPage],
    queryFn: () =>
      fetchTriagens({
        page: currentPage,
        per_page: itemsPerPage,
      }),
  })

  const queryClient = useQueryClient()

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

  const { mutateAsync: updateTriagemFn } = useMutation({
    mutationFn: updateTriagem,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['triagens'],
        exact: false, // Invalida TODAS as queries que começam com 'pacientes'
      })
    },
  })

    //Criar consulta
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
  

  const { mutateAsync: alterarEstadoPacienteFn } = useMutation({
    mutationFn: alterEstadoPaciente,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['pacientes'],
        exact: false, // Invalida TODAS as queries que começam com 'pacientes'
      })
    },
  })

  async function handleSubmitForm(data: TriagemFormData) {
    try {
      if (selectedTriagem) {
        const updateData = { paciente_id: selectedTriagem?.paciente.paciente_id, status_triagem: '1', ...data }
        await updateTriagemFn({
          triagem_id: selectedTriagem.triagem_id,
          ...updateData,
        })
      }
      setSelectedTriagem(null)
      reset() // Limpa o formulário após o envio
      closeDialog()
      alert('Triagem realizada com sucesso!')
    } catch (error) {
      console.log('Erro ao realizar triagem', error)
    }
  }

  async function handleSubmitFormConsulta(data: ConsultaformData) {
    try {
      let result;
      if (selectedTriagem) {
        if(isConsultaNaHora) {
          const createdData = { paciente_id: selectedTriagem?.paciente.paciente_id, tipo: 'na_hora', ...data }
            await createConsultaFn({
            triagem_id: selectedTriagem.triagem_id,
            ...createdData,
          })
        } else {
          const createdData = { paciente_id: selectedTriagem?.paciente.paciente_id, tipo: 'marcada', ...data }
          result =  await createConsultaFn({
            triagem_id: selectedTriagem.triagem_id,
            ...createdData,
          })

        }
      }
      if(isConsultaNaHora) {
        await handleAlterarEstadoPacienteFn('Consultório')
        alert('Paciente enviado para consultório!')
      }else{
        await handleAlterarEstadoPacienteFn('Consulta agendada')
        alert('Consulta realizada com sucesso!')
        // console.log("Result: ",result);
        //Abrir pdf da consulta
        abrirPdfConsulta(result?.consulta_id);
      }
      setSelectedTriagem(null)
      reset() // Limpa o formulário após o envio
      closeDialogConsulta()
    } catch (error) {
      console.log('Erro ao realizar triagem', error)
    }
  }

  async function handleAlterarEstadoPacienteFn(statu: string) {
    // if (!triagemToConsultorio) return
    try {
        await alterarEstadoPacienteFn({
          paciente_id: selectedTriagem?.paciente.paciente_id,
          status: statu,
        })
        // setTriagemToConsultorio(null)
        // alert('Consulta realizada com sucesso!')
      } catch (error) {
        console.log('Erro ao alterar o status do paciente para consultorio',error)
      }
  }

  async function abrirPdfConsulta(idConsulta: string | number) {
    try {
      const response = await api.get(`consulta-agendada-pdf?consulta=${idConsulta}`,{
        responseType: 'blob'
      });

      const url = URL.createObjectURL(new Blob([response.data], {type: 'application/pdf'}));
      window.open(url,'_blank');
    } catch (error) {
      console.log("Erro ao abrir o pdf",error);
    }
  }

  function handleConsultaNaHora(item: any) {
    setIsConsultaNaHora(true)
    openDialogMarcarConsulta(item)
  }

  // Delete Handler
//   async function handleDelete() {
//     if (!triagemToConsultorio) return
//     try {
//       await deleteTriagemFn(triagemToConsultorio.paciente_id)
//       setTriagemToConsultorio(null)
//     } catch (error) {
//       console.log('Erro ao excluir paciente')
//     }
//   }

  // Edit Handler
//   function handleEdit(paciente: TriagemType) {
//     console.log(paciente.sexo)
//     setSelectedTriagem(paciente)
//     setValue('nome', paciente.nome)
//     setValue('email', paciente.email)
//     setValue('telefone', paciente.telefone)
//     setValue('sexo', paciente.sexo)
//     setValue('endereco', paciente.endereco)
//     setValue('data_nascimento', paciente.data_nascimento)
//     setValue('grupo_sanguineo', paciente.grupo_sanguineo)
//     setIsDialogOpen(true)
//   }

function openDialogfazerTriagem(item: any){
    setSelectedTriagem(item);
    setIsDialogOpen(true);
}

function openDialogMarcarConsulta(item: any){
  setSelectedTriagem(item);
  setIsDialogConsultaOpen(true);
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
          {/* Dialog de fazer triagem */}
          <Dialog
            open={isDialogOpen}
            onOpenChange={open => {
              if (!open) {
                reset()
                setSelectedTriagem(null)
              }
              setIsDialogOpen(open)
            }}
          >
            <DialogContent className="sm:max-w-[425px] md:max-w-[700px]">
              <form onSubmit={handleSubmit(handleSubmitForm)}>
                <DialogHeader>
                  <DialogTitle>
                    Triagem
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="paciente_id" className="text-right">
                      Paciente
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="paciente_id"
                        defaultValue={selectedTriagem?.paciente.nome}
                        disabled
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="grupo_sanguineo" className="text-right">
                      Grupo Sanguineo
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="grupo_sanguineo"
                        defaultValue={selectedTriagem?.paciente.grupo_sanguineo}
                        disabled
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="temperatura" className="text-right">
                      Temperatura
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="temperatura"
                        {...register('temperatura')}
                        className={errors.temperatura && 'border-red-500'}
                      
                      />
                      {errors.temperatura && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.temperatura.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="tensao_arterial" className="text-right">
                      Tensão Arterial
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="tensao_arterial"
                        {...register('tensao_arterial')}
                        className={errors.tensao_arterial && 'border-red-500'}
                       type='number'
                      />
                      {errors.tensao_arterial && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.tensao_arterial.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="peso" className="text-right">
                      Peso
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="peso"
                        {...register('peso')}
                        className={errors.peso && 'border-red-500'}
                       type='number'
                      />
                      {errors.peso && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.peso.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="frequencia_respiratoria" className="text-right">
                      Frequência Respiratória
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="frequencia_respiratoria"
                        {...register('frequencia_respiratoria')}
                        className={errors.frequencia_respiratoria && 'border-red-500'}
                       type='number'
                      />
                      {errors.frequencia_respiratoria && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.frequencia_respiratoria.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="frequencia_cardiaca" className="text-right">
                    Frequência Cardiáca
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="frequencia_cardiaca"
                        {...register('frequencia_cardiaca')}
                        className={errors.frequencia_cardiaca && 'border-red-500'}
                        type='number'
                      />
                      {errors.frequencia_cardiaca && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.frequencia_cardiaca.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <hr />

                  {/* <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="especialidade" className="text-right">
                      Especialidade
                    </Label>
                    <div className="col-span-3">
                      <Select
                        value={watch('especialidade')?.toString() || ''}
                        onValueChange={value =>
                          setValue('especialidade', value.toString())
                        }
                      >
                        <SelectTrigger
                          className={`${errors.especialidade && 'border-red-500'} text-gray-400 dark:text-gray-300`}
                        >
                          <SelectValue placeholder="Selecione a especialidade" />
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
                      {errors.especialidade && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.especialidade.message}
                        </p>
                      )}
                    </div>
                  </div> */}

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="profissional_saude" className="text-right">
                      Médico
                    </Label>
                    <div className="col-span-3">
                      <Select
                        value={watch('profissional_saude')?.toString() || ''}
                        onValueChange={value =>
                          setValue('profissional_saude', value.toString())
                        }
                      >
                        <SelectTrigger
                          className={`${errors.profissional_saude && 'border-red-500'} text-gray-400 dark:text-gray-300`}
                        >
                          <SelectValue placeholder="Médicos disponíveis" />
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
                      {errors.profissional_saude && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.profissional_saude.message}
                        </p>
                      )}
                    </div>
                  </div>

                </div>
                <DialogFooter>
                  <Button type='submit'>
                    Salvar
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

            {/* Dialog de marcar consulta */}
            <Dialog
            open={isDialogConsultaOpen}
            onOpenChange={open => {
              if (!open) {
                reset()
                setIsConsultaNaHora(false)
                setSelectedTriagem(null)
              }
              setIsDialogConsultaOpen(open)
            }}
          >
            <DialogContent className="sm:max-w-[425px] md:max-w-[700px]">
              <form onSubmit={handleSubmitConsulta(handleSubmitFormConsulta)}>
                <DialogHeader>
                  <DialogTitle>
                  {isConsultaNaHora ? 'Enviar para consultório' : 'Nova Consulta'}
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">

                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="paciente_id" className="text-right">
                      Paciente
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="paciente_id"
                        defaultValue={selectedTriagem?.paciente.nome}
                        disabled
                      />
                    </div>
                  </div>

                  <div className={`grid grid-cols-4 items-center gap-4 ${isConsultaNaHora && 'hidden'}`}>
                    <Label htmlFor="data_consulta" className="text-right">
                      Data da Consulta
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="data_consulta"
                        {...registerConsulta('data_consulta')}
                        className={errorsConsulta.data_consulta && 'border-red-500'}
                        type="datetime-local"
                      />
                      {errorsConsulta.data_consulta && (
                        <p className="text-red-500 text-sm mt-1">
                          {errorsConsulta.data_consulta.message}
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
                        value={watchConsulta('tipo_consulta_id')?.toString() || ''}
                        onValueChange={value =>
                          setValueConsulta('tipo_consulta_id', value.toString())
                        }
                      >
                        <SelectTrigger
                          className={`${errorsConsulta.tipo_consulta_id && 'border-red-500'} text-gray-400 dark:text-gray-300`}
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
                      {errorsConsulta.tipo_consulta_id && (
                        <p className="text-red-500 text-sm mt-1">
                          {errorsConsulta.tipo_consulta_id.message}
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
                        value={watchConsulta('prioridade')?.toString() || ''}
                        onValueChange={value =>
                          setValueConsulta('prioridade', value.toString())
                        }
                      >
                        <SelectTrigger
                          className={`${errorsConsulta.prioridade && 'border-red-500'} text-gray-400 dark:text-gray-300`}
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
                      {errorsConsulta.prioridade && (
                        <p className="text-red-500 text-sm mt-1">
                          {errorsConsulta.prioridade.message}
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
                        value={watchConsulta('tipo_servico_id')?.toString() || ''}
                        onValueChange={value =>
                          setValueConsulta('tipo_servico_id', value.toString())
                        }
                      >
                        <SelectTrigger
                          className={`${errorsConsulta.tipo_servico_id && 'border-red-500'} text-gray-400 dark:text-gray-300`}
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
                      {errorsConsulta.tipo_servico_id && (
                        <p className="text-red-500 text-sm mt-1">
                          {errorsConsulta.tipo_servico_id.message}
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
                        value={watchConsulta('profissional_saude_id')?.toString() || ''}
                        onValueChange={value =>
                          setValueConsulta('profissional_saude_id', value.toString())
                        }
                      >
                        <SelectTrigger
                          className={`${errorsConsulta.profissional_saude_id && 'border-red-500'} text-gray-400 dark:text-gray-300`}
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
                      {errorsConsulta.profissional_saude_id && (
                        <p className="text-red-500 text-sm mt-1">
                          {errorsConsulta.profissional_saude_id.message}
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
                        {...registerConsulta('observacoes')}
                        className={errorsConsulta.observacoes && 'border-red-500'}
                      />
                      {errorsConsulta.observacoes && (
                        <p className="text-red-500 text-sm mt-1">
                          {errorsConsulta.observacoes.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">
                    Salvar
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Dialog de Confirmação de Exclusão */}
          <Dialog
            open={!!triagemToConsultorio}
            onOpenChange={open => !open && setTriagemToConsultorio(null)}
          >
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Confirmar envio</DialogTitle>
                <DialogDescription>
                 Deseja enviar o paciente para o consultório{' '}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setTriagemToConsultorio(null)}
                >
                  Cancelar
                </Button>
                <Button className="default" onClick={handleAlterarEstadoPacienteFn}>
                  Enviar
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
                    Gênero
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-lg dark:text-gray-400"
                  >
                    Idade
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-lg dark:text-gray-400"
                  >
                    Estado da Triagem
                  </TableCell>
                  
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {paginatedData?.data.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {item.paciente.nome}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {(item.paciente.sexo) == 'M' ? 'Masculino' : 'Feminino'}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {calcIdade(item.paciente.data_nascimento)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <Badge
                        size="sm"
                        color={(item.status_triagem) == '0' ? 'error' : 'success'}
                      >
                        {(item.status_triagem) == 0 ? 'Não realizada' : 'Realizada'}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className={`${(item.status_triagem) == '0' ? 'bg-green-600 hover:bg-green-500' : 'hidden'}`}
                          onClick={() => openDialogfazerTriagem(item)}
                        >
                          Fazer triagem
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleConsultaNaHora(item)}
                          className={`${(item.status_triagem) == '0' ? 'hidden' : ''}`}
                        >
                          Enviar para o consultório
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => openDialogMarcarConsulta(item)}
                          className={`${(item.status_triagem) == '0' ? 'hidden' : 'bg-purple-600 hover:bg-purple-500'}`}
                        >
                          Marcar consulta
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
