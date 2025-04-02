'use client'

import Badge from '@/components/ui_old/badge/Badge'
import { getTipoConsultas } from '@/services/consultas'
import type { ConsultaType } from '@/types'
import { User2 } from 'lucide-react'
import { useEffect, useState } from 'react'

type CardPaciente = {
  consultaSelected: ConsultaType | null
  setConsultaSelected: (consulta: ConsultaType) => void
  consulta: ConsultaType
}

export default function CardPaciente({
  consultaSelected,
  setConsultaSelected,
  consulta,
}: CardPaciente) {

  // const [consultasNaHora, setConsultasNaHora] = useState<ConsultaType[]>([])

  // useEffect(() => {
  //   async function pegarConsultasNaHora() {
  //     const response = await getTipoConsultas('marcada')
  //     setConsultasNaHora(response)
  //   }
  //   pegarConsultasNaHora()
  // }, [consultaSelected])


  function handleConsultaSelected(consulta: ConsultaType) {
    setConsultaSelected(consulta)
  }

  return (
    <div
      key={consulta.consulta_id}
      className={`border text-gray-500 dark:text-gray-400 py-2 flex flex-col justify-between items-center w-[160px] h-[160px] cursor-pointer ${
        consultaSelected?.consulta_id === consulta.consulta_id
          ? 'border-gray-100 bg-gray-200 pl-4 pr-4 dark:border-gray-800 dark:bg-gray-700'
          : 'border-gray-100 bg-white dark:bg-white/[0.03] pl-4 pr-4 dark:border-gray-800 dark:bg-gray-700 '
      } `}
      onClick={() => handleConsultaSelected(consulta)}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleConsultaSelected(consulta)
        }
      }}
    >
      <User2 />
      <h2 className="text-gray-800 dark:text-white/90">
        {consulta.paciente.nome}
      </h2>
      {consulta.status === 'Internado' ? (
        <Badge size='sm'>
          INTERNADO
        </Badge>
      ) : (
        <Badge size='sm' color="success">
          {consulta.prioridade}
        </Badge>
      )}
      <span className="text-sm text-center p-2">
        {consulta.tipo_consulta.nome}
      </span>
    </div>
  )
}
