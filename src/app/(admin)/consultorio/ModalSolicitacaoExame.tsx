'use client'

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createSolicitacaoExame } from '@/services/solicitacaoExame'
import { useAuthStore } from '@/store/authStore'
import type { PacienteType, ConsultaType } from '@/types'
import Alert from '@/utils/alert'
import { useState } from 'react'

// Esquema de validação com Zod
const SolicitacaoExameSchema = z.object({
  // status: z.string(),
  tipo_exame: z.string().min(1, 'Selecione o tipo de exame'),
  //   data_solicitacao: z.string(),
  //   paciente_id: z.string(),
  //   profissional_saude_solicitante_id: z.string(),
  urgencia: z.string(),
  //   usuario_id: z.string(),
})

type SolicitacaoExameFormData = z.infer<typeof SolicitacaoExameSchema>

interface ModalSolicitacaoExameProps {
  isDialogOpen: boolean
  setIsDialogOpen: (value: boolean) => void
  paciente: PacienteType | undefined
  consulta: ConsultaType | null
}

export default function ModalSolicitacaoExame({
  isDialogOpen,
  setIsDialogOpen,
  paciente,
  consulta
}: ModalSolicitacaoExameProps) {
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
  } = useForm<SolicitacaoExameFormData>({
    resolver: zodResolver(SolicitacaoExameSchema),
  })

  const { user } = useAuthStore();

  const queryClient = useQueryClient()

  const { mutateAsync: createSolicitacaoExameFn } = useMutation({
    mutationFn: createSolicitacaoExame,
    onSuccess: () => {
      // Invalidar todas as páginas
      queryClient.invalidateQueries({
        queryKey: ['solicitacao_exame'],
        exact: false,
      })
    },
  })

  async function handleSubmitForm(data: SolicitacaoExameFormData) {
    try {
    // console.log(user?.usuario_id)
    // return
      await createSolicitacaoExameFn({
        tipo_exame: data.tipo_exame,
        status: 'Solicitado',
        paciente_id: paciente?.paciente_id,
        profissional_saude_solicitante_id: user?.usuario_id,
        urgencia: data.urgencia,
        consulta_id: consulta.consulta_id,
        usuario_id: user?.usuario_id,
      })
      reset() // Limpa o formulário após o envio
      closeDialog();
      Alert.success('Operação concluída!', 'Exames solicitados com sucesso.')
    } catch (error) {
      console.log('Erro ao solicitar exame', error)
    }
  }

  return (
    <>
          {/* Dialog de Criação/Edição */}
          <Dialog
            open={isDialogOpen}
            onOpenChange={open => {
              setIsDialogOpen(open)
            }}
          >
            <DialogContent className="sm:max-w-[425px] md:max-w-[700px]">
              <form onSubmit={handleSubmit(handleSubmitForm)}>
                <DialogHeader>
                  <DialogTitle>Solicitar Exame</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="paciente_id" className="text-right">
                      Paciente
                    </Label>
                    <div className="col-span-3">
                      <Input
                        disabled
                        id="paciente_id"
                        value={paciente?.nome || ''}
                        type="text"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="data_consulta" className="text-right">
                      Tipo de Exame
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="tipo_exame"
                        {...register('tipo_exame')}
                        className={errors.tipo_exame && 'border-red-500'}
                        type="text"
                      />
                      {errors.tipo_exame && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.tipo_exame.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="urgencia" className="text-right">
                      Urgência
                    </Label>
                    <div className="col-span-3">
                      <Select
                        value={watch('urgencia')?.toString() || ''}
                        onValueChange={value =>
                          setValue('urgencia', value.toString())
                        }
                      >
                        <SelectTrigger
                          className={`${errors.urgencia && 'border-red-500'} text-gray-400 dark:text-gray-300`}
                          defaultValue={''}
                        >
                          <SelectValue placeholder="Selecione o tipo de urgência" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={'Baixa'}>Baixa</SelectItem>
                          <SelectItem value={'Media'}>Média</SelectItem>
                          <SelectItem value={'Alta'}>Alta</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.urgencia && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.urgencia.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Solicitar</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
    </>
  )
}
