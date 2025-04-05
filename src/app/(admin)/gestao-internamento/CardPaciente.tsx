'use client'

import Badge from '@/components/ui_old/badge/Badge'
import { getTipoConsultas } from '@/services/internamentos'
import type { ConsultaType, InternamentoType } from '@/types'
import { Bed, User2 } from 'lucide-react'
import { useEffect, useState } from 'react'

type CardPaciente = {
  internamentoSelected: InternamentoType | null
  setInternamentoSelected: (internamento: InternamentoType) => void
  internamento: InternamentoType
}

export default function CardPaciente({
  internamentoSelected,
  setInternamentoSelected,
  internamento,
}: CardPaciente) {

  // const [internamentosNaHora, setConsultasNaHora] = useState<ConsultaType[]>([])

  // useEffect(() => {
  //   async function pegarConsultasNaHora() {
  //     const response = await getTipoConsultas('marcada')
  //     setConsultasNaHora(response)
  //   }
  //   pegarConsultasNaHora()
  // }, [internamentoSelected])


  function handleConsultaSelected(internamento: InternamentoType) {
    setInternamentoSelected(internamento)
  }

  return (
    <div
      className={`border text-gray-500 dark:text-gray-400 py-2 flex flex-col justify-between items-center w-[160px] h-[160px] cursor-pointer ${
        internamentoSelected?.internamento_id === internamento.internamento_id
          ? 'border-gray-100 bg-gray-200 pl-4 pr-4 dark:border-gray-800 dark:bg-gray-700'
          : 'border-gray-100 bg-white dark:bg-white/[0.03] pl-4 pr-4 dark:border-gray-800 dark:bg-gray-700 '
      } `}
      onClick={() => handleConsultaSelected(internamento)}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleConsultaSelected(internamento)
        }
      }}
    >
      <Bed />
      <h2 className="text-gray-800 dark:text-white/90">
        {internamento?.paciente.nome}
      </h2>
        <Badge size='sm' color={`${internamento.estado_paciente === 'Estável' ? 'success' : internamento.estado_paciente === 'Crítico' ? 'error' : 'warning'}`}>
          {internamento.estado_paciente}
        </Badge>
      <span className="text-sm text-center p-2">
        {internamento.cama.descricao}
      </span>
    </div>
  )
}
