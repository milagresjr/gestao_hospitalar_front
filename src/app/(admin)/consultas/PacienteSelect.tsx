'use client'

import api from '@/services/api'
import type { PacienteType } from '@/types'
import { useFloating } from '@floating-ui/react'
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/react'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'
import { useEffect, useState } from 'react'

interface PacienteSelectProps {
  value?: string
  onChange?: (value: string) => void
}

export default function PacienteSelect({ value, onChange }: PacienteSelectProps) {
  const [query, setQuery] = useState('')
  const [pacientes, setPacientes] = useState<PacienteType[]>([])

  const { refs, floatingStyles } = useFloating()

  useEffect(() => {
    async function getPacientes() {
      const response = await api.get('pacientes')
      setPacientes(response.data.data)
    }
    getPacientes()
  }, [])

  const filteredPeople =
    query === ''
      ? pacientes
      : pacientes.filter(person => {
          return person.nome.toLowerCase().includes(query.toLowerCase())
        })

  return (
    <div className="relative">
      <Combobox
        value={value}
        onChange={(newValue: string) => {
          if (onChange) {
            onChange(newValue)
          }
        }}
        onClose={() => setQuery('')}
      >
        <div className="relative">
          <ComboboxInput
            className={clsx(
              'w-full rounded-lg border-none bg-white/5 py-1.5 pr-8 pl-3 text-sm/6 text-white',
              'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25'
            )}
            displayValue={(pacienteId: string) => {
              const paciente = pacientes.find(p => p.paciente_id === pacienteId)
              return paciente ? paciente.nome : ''
            }}
            onChange={event => setQuery(event.target.value)}
          />
          <ComboboxButton className="group absolute inset-y-0 right-0 px-2.5">
            <ChevronDownIcon className="size-4 fill-white/60 group-data-[hover]:fill-white" />
          </ComboboxButton>
        </div>

        <ComboboxOptions
          ref={refs.setFloating}
          style={floatingStyles}
          anchor="bottom"
          className={clsx(
            'z-999999 w-[var(--input-width)] rounded-xl border border-gray-200 bg-white p-2 shadow-lg [--anchor-gap:8px]',
            'focus:outline-none'
          )}
        >
          {filteredPeople.map(person => (
            <ComboboxOption
              key={person.paciente_id}
              value={person.paciente_id}
              className="group z-999999 flex cursor-default items-center gap-2 rounded-lg py-2 px-3 select-none data-[focus]:bg-gray-100 hover:bg-gray-100"
            >
              <CheckIcon className=" z-999999 invisible size-4 fill-blue-600 group-data-[selected]:visible" />
              <div className=" z-999999 text-sm/6 text-gray-900">
                {person.nome}
              </div>
            </ComboboxOption>
          ))}
        </ComboboxOptions>
      </Combobox>
    </div>
  )
}