'use client'

import { BedIcon, CheckCircle, FileText, HomeIcon, Plus, PlusCircle } from "lucide-react"
import CardPaciente from "./CardPaciente"
import { useEffect, useState } from "react"
import { getTipoConsultas } from "@/services/consultas"
import { InternamentoType } from "@/types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { fetchInternamentos, PaginatedInternamentos, updateInternamento } from "@/services/internamento"
import { formatDate, formatDateTime } from "@/utils"
import ModalNovoInternamento from "./ModalNovoInternamento"
import Badge from "@/components/ui_old/badge/Badge"
import ModalMudarCama from "./ModalMudarCama"
import Alert from "@/utils/alert"
import { updateCama } from "@/services/camas"


export function ContentInternamento() {

    const [selectedInternamento, setSelectedInternamento] = useState<InternamentoType | null>(
        null
      )    

    const [isDialogOpenNovoInternamento, setIsDialogOpenNovoInternamento] = useState(false)
    const [isDialogOpenMudarCama, setIsDialogOpenMudarCama] = useState(false)
 
  const [todosInternamentos, setTodosInternamentos] = useState<InternamentoType[]>([])

   const [currentPage, setCurrentPage] = useState(1)
   const [itemsPerPage, setItemsPerPage] = useState(10)

  async function pegarTodosInternamentos() {
    const response = await getTipoConsultas('') //Mudar pra pegar todas consultas e nao so as marcadas
    setTodosInternamentos(response)
  }


    const {
      data: internamentos,
      isLoading,
      error,
      refetch
    } = useQuery<PaginatedInternamentos>({
      queryKey: ['internamentos', currentPage, itemsPerPage],
      queryFn: () =>
        fetchInternamentos({
          page: currentPage,
          per_page: itemsPerPage,
        }),
    })

    const internamentosFiltered = internamentos?.data.filter((internamento: InternamentoType) => {
        return (internamento.estado !== "Alta" && internamento.estado !== "Óbito")
    })

    const queryClient = useQueryClient()

    const { mutateAsync: updateInternamentoFn } = useMutation({
        mutationFn: updateInternamento,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['internamentos'],
                exact: false,
            })
        },
    })

    const { mutateAsync: updateCamaFn } = useMutation({
        mutationFn: updateCama,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['camas'],
                exact: false,
            })
        },
    })

    async function handleUpdateEstado(estado: string, message: string) {
        try {
            await updateInternamentoFn({
                internamento_id: selectedInternamento?.internamento_id,
                estado: estado,
            })
            await updateCamaFn({
                cama_id: selectedInternamento?.cama_id,
                estado: '0',
            })
            Alert.success('Operação concluída!',message)
            refetch()
            setSelectedInternamento(null)
        } catch (error) {
            console.log('Erro ao alterar o estado', error)
        }
    }

      function handleDarAlta() {
        Alert.confirm("Confirmar ","Deseja Dar Alta ao paciente?",({
          confirmCallback: async () => {
            await handleUpdateEstado('Alta','Alta dada com sucesso.')
          },
          cancelCallback: () => {
            Alert.info('Operação cancelada.')
          },
        }))
      }

      function handleReportarObito() {
        Alert.confirm("Confirmar ","Deseja reportar o óbito do paciente?",({
          confirmCallback: async () => {
            await handleUpdateEstado('Óbito','Óbito reportado com sucesso.')
          },
          cancelCallback: () => {
            Alert.info('Operação cancelada.')
          },
        }))
      }

      function handleTransferirPaciente() {
        Alert.confirm("Confirmar ","Deseja fazer a transferência do paciente?",({
          confirmCallback: async () => {
            await handleUpdateEstado('Transferido','Transferência realizada com sucesso.')
          },
          cancelCallback: () => {
            Alert.info('Operação cancelada.')
          },
        }))
      }

    
  function onCallbackNovoInternamento() {
    refetch()
  }

  function onCallbackCamaChanged() {
    refetch()
  }

   useEffect(() => {
      pegarTodosInternamentos()
    }, [])


  return (
    <>
    <div className="flex flex-col h-[calc(100vh-13rem)] relative">
      <div className="flex flex-1  h-[calc(100vh-40rem)]">

        <div className="w-[450px] flex flex-col gap-1 border text-gray-500 dark:text-gray-400 border-gray-100 bg-white pl-4 pr-4 dark:border-gray-800 dark:bg-white/[0.03] p-2 overflow-auto">
        
        <div className="flex flex-col gap-1 border-b border-gray-200 pb-2 ">
         <h2 className="text-gray-500 dark:text-gray-400 text-2xl">Paciente</h2>
         <h2 className="text-gray-500 dark:text-gray-400 text-3xl">{selectedInternamento?.paciente.nome}</h2>
        </div>

        <div className="flex gap-2 items-center mt-4">

        <div className="flex gap-2 items-center">
        <HomeIcon size={40} className="text-gray-500 dark:text-gray-400" />
        <span className="text-gray-500 dark:text-gray-400 text-lg">{selectedInternamento?.cama?.sala?.descricao ?? ''}</span>
        </div>

        <div className="flex gap-2 items-center">
        <BedIcon size={40} className="text-gray-500 dark:text-gray-400" />
        <span className="text-gray-500 dark:text-gray-400 text-lg">{selectedInternamento?.cama.descricao}</span>
        </div>
        
        </div>

        <div className="flex flex-col mt-4">
        <h2 className="text-gray-500 dark:text-gray-400 text-2xl">Diagnóstico: </h2>
        <p>
            {selectedInternamento?.diagnostico}
        </p>
        </div>

        <div className="flex flex-col mt-4">
        <h2 className="text-gray-500 dark:text-gray-400 text-2xl">Motivo de Internamento: </h2>
        <p>
            {selectedInternamento?.motivo_internamento}
        </p>
        </div>

        <div className="flex flex-col mt-4">
        <h2 className="text-gray-500 dark:text-gray-400 text-2xl">Observações: </h2>
        <p>
            {selectedInternamento?.observacoes}
        </p>
        </div>

        <div className="flex items-center gap-1 mt-4">
        <h2 className="text-gray-500 dark:text-gray-400 text-2xl">Internado desde: </h2>
        <p>
            {formatDate(selectedInternamento?.data_entrada)}
        </p>
        </div>

        <div className="flex items-center gap-2 mt-4">
        <h2 className="text-gray-500 dark:text-gray-400 text-2xl">Estado: </h2>
        <Badge>
            {selectedInternamento?.estado}
        </Badge>
        </div>
        
        </div>

        <div className="flex-1 border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-2 flex flex-wrap gap-2">
        {
          isLoading ? (<p className="text-gray-500 dark:text-gray-400">Carregando...</p>) : (
            internamentosFiltered?.map((internemnto: InternamentoType) => (
                <CardPaciente
                internamentoSelected={selectedInternamento}
                setInternamentoSelected={setSelectedInternamento}
                internamento={internemnto}
                key={internemnto.internamento_id}
                />
              ))
          )
          
        }
        </div>
      </div>

      <div className="flex gap-2 border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-2 fixed bottom-0">
        <button
        type="button"
        className="bg-green-700 hover:bg-green-600 text-sm text-white p-2 rounded-md flex items-center gap-2 disabled:bg-gray-300 disabled:text-gray-700"
        disabled={(!selectedInternamento?.paciente)}
        onClick={handleDarAlta}
        >
        <CheckCircle size={16} />
        Dar Alta
        </button>
        <button
        type="button"
        className="bg-blue-700 hover:bg-blue-600 text-sm text-white p-2 rounded-md flex items-center gap-2 disabled:bg-gray-300 disabled:text-gray-700"
        onClick={() => setIsDialogOpenNovoInternamento(true)}
        >
        <Plus size={16} />
        Novo Internamento
        </button>
        <button
        type="button"
        className="bg-yellow-700 hover:bg-yellow-600 text-sm text-white p-2 rounded-md flex items-center gap-2 disabled:bg-gray-300 disabled:text-gray-700"
        disabled={(!selectedInternamento?.paciente)}
        onClick={handleTransferirPaciente}
        >
        <FileText size={16} />
        Transferir Paciente
        </button>
        <button
        type="button"
        className="bg-purple-700 hover:bg-purple-600 text-sm text-white p-2 rounded-md flex items-center gap-2 disabled:bg-gray-300 disabled:text-gray-700"
        disabled={(!selectedInternamento?.paciente)}
        onClick={() => setIsDialogOpenMudarCama(true)}
        >
        <PlusCircle size={16} />
        Mudar de Cama
        </button>
        <button
        type="button"
        className="bg-red-700 hover:bg-red-600 text-sm text-white p-2 rounded-md flex items-center gap-2 disabled:bg-gray-300 disabled:text-gray-700"
        disabled={(!selectedInternamento?.paciente)}
        onClick={handleReportarObito}
        >
        <FileText size={16} />
        Reportar Óbito
        </button>
      </div>
    </div>

    
    <ModalNovoInternamento
        setIsDialogOpen={setIsDialogOpenNovoInternamento}
        isDialogOpen={isDialogOpenNovoInternamento}
        onInternamentoAdded={onCallbackNovoInternamento}
    />

    <ModalMudarCama
        setIsDialogOpen={setIsDialogOpenMudarCama}
        isDialogOpen={isDialogOpenMudarCama}
        onCamaChanged={onCallbackCamaChanged}
        internamento={selectedInternamento}
    />

    </>
  )
}
