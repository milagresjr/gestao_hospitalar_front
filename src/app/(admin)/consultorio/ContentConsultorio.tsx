'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Badge from '@/components/ui_old/badge/Badge'
import { consultasPorPaciente, examesByConsulta, getTipoConsultas, updateConsulta } from '@/services/consultas'
import type { ConsultaType, ReceitaType, SolicitacaoExameType } from '@/types'
import { calcIdade, formatDateTime } from '@/utils'
import Alert from '@/utils/alert'
import {
  CheckCircle,
  Eye,
  FileText,
  PlusCircle,
  Printer,
  PrinterIcon,
  Send,
  User2,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import CardPaciente from './CardPaciente'
import ModalSolicitacaoExame from './ModalSolicitacaoExame'
import ModalAddReceita from './ModalAddReceita'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchReceitas, PaginatedReceitas, receitasPorConsulta } from '@/services/receita'
import ModalEnviarInternamento from './ModalEnviarInternamento'
import api from '@/services/api'

export function ContentConsultorio() {
  const [selectedConsulta, setSelectedConsulta] = useState<ConsultaType | null>(
    null
  )

  const [consultasPaciente, setConsultasPaciente] = useState<ConsultaType[]>([])
  const [examesPacienteByConsulta, setExamesPacienteByConsulta] = useState<
    SolicitacaoExameType[]
  >([])
  const [receitasConsultas, setReceitasConsulta] = useState<ReceitaType[]>([])

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const [isDialogOpenReceita, setIsDialogOpenReceita] = useState(false)

  const [isDialogOpenEnviarInternamento, setIsDialogOpenEnviarInternamento] = useState(false)

  async function pegarUltimasConsultaPaciente() {
    if (!selectedConsulta) return

    try {
      const response = await consultasPorPaciente(selectedConsulta.paciente_id)
      setConsultasPaciente(response)
    } catch (error) {
      console.error('Erro ao pegar ultimas consultas:', error)
    }
  }
  async function pegarExamesPacienteByconsulta() {
    if (!selectedConsulta) return

    try {
      const response = await examesByConsulta(selectedConsulta.consulta_id)
      setExamesPacienteByConsulta(response)
    } catch (error) {
      console.error('Erro ao pegar exames da consulta:', error)
    }
  }

  async function pegarReceitasPacienteByconsulta() {
    if (!selectedConsulta) return

    try {
      const response = await receitasPorConsulta(selectedConsulta.consulta_id)
      setReceitasConsulta(response)
    } catch (error) {
      console.error('Erro ao buscar receitas da consulta:', error)
    }
  }

  // const { data: receitas, refetch: refetchReceita } = useQuery({
  //   queryKey: ['receitas'],
  //   queryFn: fetchReceitas,
  // })

    const queryClient = useQueryClient()
  
    const { mutateAsync: updateConsultaFn } = useMutation({
      mutationFn: updateConsulta,
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['consultas'],
          exact: false, // Invalida TODAS as queries que começam com 'pacientes'
        })
      },
    })

  function handleReceitaAdded() {
    // Atualiza a tabela de receitas
    pegarReceitasPacienteByconsulta()
  }

    async function abrirPdfFinalizarConsulta(idConsulta: string | number) {
      try {
        const response = await api.get(`consulta-finalizada-pdf?consulta=${idConsulta}`,{
          responseType: 'blob'
        });
  
        const url = URL.createObjectURL(new Blob([response.data], {type: 'application/pdf'}));
        window.open(url,'_blank');
      } catch (error) {
        console.log("Erro ao abrir o pdf",error);
      }
    }

  function showObs(obs: string) {
    Alert.info('Observações:', obs)
  }

  const [todasConsultas, setTodasConsultas] = useState<ConsultaType[]>([])

  async function pegarTodasConsultas() {
    const response = await getTipoConsultas('') //Mudar pra pegar todas consultas e nao so as marcadas
    setTodasConsultas(response)
  }

   useEffect(() => {
      pegarTodasConsultas()
    }, [])

  useEffect(() => {
    pegarUltimasConsultaPaciente()
    pegarExamesPacienteByconsulta()
    pegarReceitasPacienteByconsulta()
  }, [selectedConsulta])

  async function onCallbackConsultas() {
    await pegarTodasConsultas()
    const consultaFiltrada = todasConsultas.find(
      consulta => consulta.consulta_id === selectedConsulta?.consulta_id
    )
    console.log("Consulta: ",consultaFiltrada)
    setSelectedConsulta(null)
    // console.log("onCallbackConsultas -- Entrou segunda vez!")
  }

   function handleFinalizarConsulta() {
    Alert.confirm("Confirmar ","Deseja finalizar a consulta?",({
      confirmCallback: async () => {
        console.log("MEus exames",examesPacienteByConsulta)
        const examesPendente = examesPacienteByConsulta.some(
          item => item.status === 'Solicitado'
          )
        console.log(examesPendente);
        if(examesPendente){
          Alert.warning("Consulta não finalizada","Não pode fnalizar esta consulta porque tem exames esperando resultado")
          return
        }
        //Alterar o status da consulta 
        try {
            await updateConsultaFn({
              consulta_id: selectedConsulta?.consulta_id,
              status: 'Finalizada',
            })
            await Alert.success('Consulta finalizada com sucesso!')
            abrirPdfFinalizarConsulta(selectedConsulta?.consulta_id)
            setSelectedConsulta(null)
            await pegarTodasConsultas()
        } catch (error) {
          console.log('Erro ao atualizar o status da consulta', error)
        }
      },
      cancelCallback: () => {
        Alert.info('Operação cancelada.')
      },
    }))
  }

  return (
    <>
      <div className="flex flex-col h-[calc(100vh-13rem)] relative">
        <div className="flex flex-1  h-[calc(100vh-40rem)]">
          <div className="w-[450px] flex flex-col gap-1 border text-gray-500 dark:text-gray-400 border-gray-100 bg-white pl-4 pr-4 dark:border-gray-800 dark:bg-white/[0.03] p-2 overflow-auto">
            <div className="p-3 min-h-18 border-b-2 border-gray-300">
              <h2>Paciente: </h2>
              <span>
                {selectedConsulta?.paciente.nome == null
                  ? ''
                  : selectedConsulta?.paciente.nome}
              </span>
            </div>
            <div className="pb min-h-[380px] border text-gray-500 dark:text-gray-400 border-gray-100 bg-white dark:border-gray-800 dark:bg-white/[0.03] w-full">
              <Tabs defaultValue="triagem" className="w-full">
                <TabsList className="w-full rounded-none">
                  <TabsTrigger value="triagem" className="w-full rounded-none">
                    Triagem
                  </TabsTrigger>
                  <TabsTrigger value="exames" className="w-full rounded-none">
                    Exames Solicitados
                  </TabsTrigger>
                  <TabsTrigger value="obs" className="w-full rounded-none">
                    Observação
                  </TabsTrigger>
                  <TabsTrigger value="receitas" className="w-full rounded-none">
                    Receitas
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="triagem">
                  <div className="flex flex-col gap-2 p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Tipo de Consulta
                      </span>
                      <Input
                        disabled
                        className="w-[60%] h-[30px]"
                        value={selectedConsulta?.tipo_consulta.nome}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Idade
                      </span>
                      <Input
                        disabled
                        className="w-[60%] h-[30px]"
                        value={
                          selectedConsulta?.paciente.data_nascimento
                            ? calcIdade(
                                selectedConsulta.paciente.data_nascimento
                              )
                            : ''
                        }
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Temperatura
                      </span>
                      <Input
                        disabled
                        className="w-[60%] h-[30px]"
                        value={selectedConsulta?.triagem?.temperatura}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        F. Cardiáca (FC)
                      </span>
                      <Input
                        disabled
                        className="w-[60%] h-[30px]"
                        value={selectedConsulta?.triagem?.frequencia_cardiaca}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Grupo Sanguineo
                      </span>
                      <Input
                        disabled
                        className="w-[60%] h-[30px]"
                        value={selectedConsulta?.paciente.grupo_sanguineo}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Peso
                      </span>
                      <Input
                        disabled
                        className="w-[60%] h-[30px]"
                        value={selectedConsulta?.triagem?.peso}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Tensão Arterial (TA)
                      </span>
                      <Input
                        disabled
                        className="w-[60%] h-[30px]"
                        value={selectedConsulta?.triagem?.tensao_arterial}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        F. respiratória
                      </span>
                      <Input
                        disabled
                        className="w-[60%] h-[30px]"
                        value={
                          selectedConsulta?.triagem?.frequencia_respiratoria
                        }
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="exames">
                  <table className="min-w-full bg-white dark:bg-gray-800">
                    <thead>
                      <tr>
                        <th className="text-sm text-left font-medium py-2 px-4 border-b-2 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400">
                          Tipo de exame
                        </th>
                        <th className="text-sm text-left font-medium py-2 px-4 border-b-2 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400">
                          Urgência
                        </th>
                        <th className="text-sm text-left font-medium py-2 px-4 border-b-2 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400">
                          Resultado
                        </th>
                        <th className="text-sm text-left font-medium py-2 px-4 border-b-2 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {examesPacienteByConsulta.map(
                        (exame: SolicitacaoExameType) => (
                          <tr
                            key={exame.solicitacao_exame_id}
                            className="hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <td className="text-sm py-1 px-4 border-b border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400">
                              {exame.tipo_exame}
                            </td>
                            <td className="text-sm py-1 px-4 border-b border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400">
                              {exame.urgencia}
                            </td>
                            <td className="text-sm py-1 px-4 border-b border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400">
                              <Badge
                                size="sm"
                                color={`${
                                  exame.resultado_exame
                                    ? exame.resultado_exame.resultado ===
                                      'positivo'
                                      ? 'success'
                                      : exame.resultado_exame.resultado ===
                                          'negativo'
                                        ? 'error'
                                        : 'warning'
                                    : 'warning'
                                }`}
                              >
                                {exame.resultado_exame
                                  ? exame.resultado_exame.resultado
                                  : 'Pendente'}
                              </Badge>
                            </td>
                            <td className="text-sm py-1 px-4 border-b border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400">
                              <span
                                className="cursor-pointer"
                                onClick={() =>
                                  showObs(exame.resultado_exame.observacao)
                                }
                              >
                                {exame.resultado_exame && <Eye size={20} />}
                              </span>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </TabsContent>
                <TabsContent value="obs">
                  
                </TabsContent>
                <TabsContent value="receitas">
                  <table className="min-w-full bg-white dark:bg-gray-800">
                    <thead>
                      <tr>
                        <th className="text-sm font-medium py-2 px-4 border-b-2 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400">
                          Fármaco
                        </th>
                        <th className="text-sm font-medium py-2 px-4 border-b-2 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400">
                          Quantidade
                        </th>
                        <th className="text-sm font-medium py-2 px-4 border-b-2 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400">
                          Vezes por dia
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {receitasConsultas?.map((receita: ReceitaType) => (
                        <tr
                          key={receita.receita_id}
                          className="hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <td className="text-sm py-2 px-4 border-b border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400">
                            {receita.farmaco?.nome} - {receita.farmaco?.dosagem}
                          </td>
                          <td className="text-sm py-2 px-4 border-b border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400">
                            {receita.qtd_por_dia}
                          </td>
                          <td className="text-sm py-2 px-4 border-b border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400">
                            {receita.vezes_por_dia}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TabsContent>
              </Tabs>
            </div>
            <div className="h-full">
              <div className="bg-gray-700 text-white text-center p-1">
                <h2>Últimas Consultas</h2>
              </div>
              <table className="min-w-full bg-white dark:bg-gray-800">
                <thead>
                  <tr>
                    <th className="text-sm text-left font-medium py-2 px-4 border-b-2 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400">
                      Data
                    </th>
                    <th className="text-sm text-left font-medium py-2 px-4 border-b-2 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400">
                      Descrição
                    </th>
                    <th className="text-sm text-left font-medium py-2 px-4 border-b-2 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400">
                      Profissional
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {consultasPaciente.map(consulta => (
                    <tr
                      key={consulta.consulta_id}
                      className="hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <td className="text-sm py-1 px-4 border-b border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400">
                        {formatDateTime(consulta.data_consulta)}
                      </td>
                      <td className="text-sm py-1 px-4 border-b border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400">
                        {consulta.tipo_consulta.nome}
                      </td>
                      <td className="text-sm py-1 px-4 border-b border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400">
                        {consulta.profissional_saude?.nome}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex-1 border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-2 flex flex-wrap gap-2">
          {
              todasConsultas.map(consulta => (
                <CardPaciente
                  consultaSelected={selectedConsulta}
                  setConsultaSelected={setSelectedConsulta}
                  consulta={consulta}
                  key={consulta.consulta_id}
                />
              ))
            }
          </div>
        </div>

        <div className="flex gap-2 border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-2 fixed bottom-0">
          <button
            type="button"
            className="bg-green-700 hover:bg-green-600 text-sm text-white p-2 rounded-md flex items-center gap-2 disabled:bg-gray-300 disabled:text-gray-700"
            disabled={(!selectedConsulta?.paciente) || (selectedConsulta?.status === 'Internado')}
            onClick={handleFinalizarConsulta}
          >
            <CheckCircle size={16} />
            Finalizar
          </button>
          <button
            type="button"
            className="bg-blue-700 hover:bg-blue-600 text-sm text-white p-2 rounded-md flex items-center gap-2 disabled:bg-gray-300 disabled:text-gray-700"
            onClick={() => setIsDialogOpen(true)}
            disabled={(!selectedConsulta?.paciente) || (selectedConsulta?.status === 'Internado')}
          >
            <FileText size={16} />
            Solicitar Exame
          </button>
          <button
            type="button"
            className="bg-red-700 hover:bg-red-600 text-sm text-white p-2 rounded-md flex items-center gap-2 disabled:bg-gray-300 disabled:text-gray-700"
            disabled={(!selectedConsulta?.paciente) || (selectedConsulta?.status === 'Internado')}
            onClick={() => setIsDialogOpenReceita(true)}
          >
            <PlusCircle size={16} />
            Adicionar Receita
          </button>
          <button
            type="button"
            className={`bg-yellow-700 hover:bg-yellow-600 text-sm text-white p-2 rounded-md disabled:bg-gray-300 disabled:text-gray-700 
              ${selectedConsulta?.status === 'Internado' ? 'hidden' : 'flex items-center gap-2'}
              `}
            disabled={!selectedConsulta?.paciente}
            onClick={() => setIsDialogOpenEnviarInternamento(true)}
          >
            <Send size={16} />
            Enviar para internamento
          </button>
          <button
            type="button"
            className={`bg-yellow-700 hover:bg-yellow-600 text-sm text-white p-2 rounded-md disabled:bg-gray-300 disabled:text-gray-700 
              ${selectedConsulta?.status === 'Internado' ? ' flex items-center gap-2' : 'hidden'}
              `}
            disabled={!selectedConsulta?.paciente}
          >
            <Eye size={16} />
            Ver internamento
          </button>
          <button
            type="button"
            className="bg-purple-700 hover:bg-purple-600 text-sm text-white p-2 rounded-md flex items-center gap-2 disabled:bg-gray-300 disabled:text-gray-700"
            disabled={(!selectedConsulta?.paciente) || (selectedConsulta?.status === 'Internado')}
          >
            <PrinterIcon size={16} />
            Imprimir
          </button>
        </div>
      </div>
      <ModalSolicitacaoExame
        setIsDialogOpen={setIsDialogOpen}
        isDialogOpen={isDialogOpen}
        paciente={selectedConsulta?.paciente}
        consulta={selectedConsulta}
      />
      <ModalAddReceita 
        setIsDialogOpen={setIsDialogOpenReceita}
        isDialogOpen={isDialogOpenReceita}
        consulta={selectedConsulta}
        onReceitaAdded={handleReceitaAdded}
      />
      <ModalEnviarInternamento 
        setIsDialogOpen={setIsDialogOpenEnviarInternamento}
        isDialogOpen={isDialogOpenEnviarInternamento}
        paciente={selectedConsulta?.paciente}
        consulta={selectedConsulta}
        onInternamentoAdded={onCallbackConsultas}
      />

    </>
  )
}
