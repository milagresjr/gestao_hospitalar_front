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

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { log } from 'console'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { PaginationComponent } from '@/components/ui_old/pagination/Pagination'
import api from '@/services/api'
import {
  createResultadoExame,
  updateResultadoExame,
} from '@/services/resultadoExame'
import {
  type PaginatedSolicitacaoExames,
  fetchSolicitacaoExame,
} from '@/services/solicitacaoExame'
import { useAuthStore } from '@/store/authStore'
import type { ResultadoExameType, SolicitacaoExameType } from '@/types'
import { formatDateTime } from '@/utils'
import Alert from '@/utils/alert'
import { Plus, ThumbsDown, ThumbsUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import Badge from '@/components/ui_old/badge/Badge'

// Esquema de validação com Zod
const resultadoExameSchema = z.object({
  observacoes: z.string(),
  resultado: z.string().min(1, 'Informe o resultado do exame'),
})

type ResultadoExameFormData = z.infer<typeof resultadoExameSchema>

export default function TableExamesSolicitado() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedExame, setSelectedExame] =
    useState<SolicitacaoExameType | null>(null)

  const [selectedResultadoExame, setSelectedResultadoExame] =
    useState<ResultadoExameType | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const { user } = useAuthStore()

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
  } = useForm<ResultadoExameFormData>({
    resolver: zodResolver(resultadoExameSchema),
  })

  const {
    data: paginatedData,
    isLoading,
    error,
  } = useQuery<PaginatedSolicitacaoExames>({
    queryKey: ['solicitacao-exame', currentPage, itemsPerPage],
    queryFn: () =>
      fetchSolicitacaoExame({
        page: currentPage,
        per_page: itemsPerPage,
      }),
  })

  const queryClient = useQueryClient()

  const { mutateAsync: createResultadoExameFn } = useMutation({
    mutationFn: createResultadoExame,
    onSuccess: () => {
      // Invalidar todas as páginas
      queryClient.invalidateQueries({
        queryKey: ['solicitacao-exame'],
        exact: false,
      })
      queryClient.invalidateQueries({
        queryKey: ['resultado-exame'],
        exact: false,
      })
    },
  })

  const { mutateAsync: updateResultadoExameFn } = useMutation({
    mutationFn: updateResultadoExame,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['solicitacao-exame'],
        exact: false,
      })
      queryClient.invalidateQueries({
        queryKey: ['resultado-exame'],
        exact: false, // Invalida TODAS as queries que começam com 'consultas'
      })
    },
  })

  async function handleSubmitForm(data: ResultadoExameFormData) {
    try {
      // console.log(data)
      //   return
      if (selectedResultadoExame) {
        await updateResultadoExameFn({
          resultado_exame_id: selectedResultadoExame.resultado_exame_id,
          responsavel_lancamento_id: user?.usuario_id,
          observacao: data.observacoes,
          resultado: data.resultado,
        })
      } else {
        await createResultadoExameFn({
          observacao: data.observacoes,
          resultado: data.resultado,
          responsavel_lancamento_id: user?.usuario_id,
          exame_id: selectedExame?.solicitacao_exame_id,
        })
      }
      setSelectedExame(null)
      reset() // Limpa o formulário após o envio
      closeDialog()
      if (selectedResultadoExame) {
        Alert.success('Operação concluída!', 'Resultado do exame atualizado.')
      } else {
        Alert.success(
          'Operação concluída!',
          'Resultado do exame lançado com sucesso'
        )
      }
    } catch (error) {
      console.log('Erro ao lancar resultado do exame', error)
    }
  }

  function handleLancarResultado(exame: SolicitacaoExameType) {
    setSelectedExame(exame)
    openDialog()
  }

  // Edit Handler
  function handleEdit(exame: ResultadoExameType) {
    setSelectedResultadoExame(exame)
    setValue('observacoes', exame.observacao)
    setValue('resultado', exame.resultado)
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
                setSelectedExame(null)
                setSelectedResultadoExame(null)
              }
              setIsDialogOpen(open)
            }}
          >
            <DialogContent className="sm:max-w-[425px] md:max-w-[700px]">
              <form onSubmit={handleSubmit(handleSubmitForm)}>
                <DialogHeader>
                  <DialogTitle>Lançar Resultado do Exame</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="paciente_id" className="text-right">
                      Resultado*
                    </Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div
                        onClick={() => setValue('resultado', 'positivo')}
                        className={`cursor-pointer w-[80px] h-[80px] border rounded-lg flex flex-col items-center justify-center gap-2 ${
                          watch('resultado') === 'positivo'
                            ? 'bg-green-100 border-green-500'
                            : 'border-gray-300'
                        }`}
                      >
                        <ThumbsUp className="text-green-500" size={28} />
                        <span className="text-green-700 font-medium select-none">
                          Positivo
                        </span>
                      </div>
                      <div
                        onClick={() => setValue('resultado', 'negativo')}
                        className={`cursor-pointer w-[80px] h-[80px] border rounded-lg flex flex-col items-center justify-center gap-2 ${
                          watch('resultado') === 'negativo'
                            ? 'bg-red-100 border-red-500'
                            : 'border-gray-300'
                        }`}
                      >
                        <ThumbsDown className="text-red-500" size={28} />

                        <span className="text-red-700 font-medium select-none">
                          Negativo
                        </span>
                      </div>
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
                    {selectedResultadoExame ? 'Salvar Alterações' : 'Salvar'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Dialog de Confirmação de Exclusão */}
          {/* <Dialog
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
          </Dialog> */}
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
                    Tipo de Exame
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-lg dark:text-gray-400"
                  >
                    Data da Solicitação
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-lg dark:text-gray-400"
                  >
                    Médico Solicitante
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-lg dark:text-gray-400"
                  >
                    Urgência
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-lg dark:text-gray-400"
                  >
                    Status do Exame
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-lg dark:text-gray-400"
                  >
                    Resultado
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {paginatedData?.data.map(item => (
                  <TableRow key={item.solicitacao_exame_id}>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {item.paciente.nome}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {item.tipo_exame}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {formatDateTime(item.data_solicitacao)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {item.profissional_saude.nome}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {item.urgencia}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {item.status}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {item.resultado_exame && item.resultado_exame.resultado !== '' ? (
                        <Badge
                        size='sm'
                        color={`${
                          item.resultado_exame.resultado === 'positivo'
                          ? 'success'
                          : 'error'
                          }`}
                        >
                        {item.resultado_exame.resultado}
                        </Badge>
                        ) : (
                        <Badge size='sm' color='warning'>
                          Por determinar
                        </Badge>
                        )}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleLancarResultado(item)}
                          className={`${
                            item.status === 'Solicitado'
                              ? 'bg-blue-600 hover:bg-blue-700'
                              : 'hidden'
                          }`}
                        >
                          Lançar Resultado
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleEdit(item.resultado_exame)}
                          className={`${
                            item.status === 'Realizado'
                              ? 'bg-green-600 hover:bg-green-700'
                              : 'hidden'
                          }`}
                        >
                          Alterar Resultado
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
