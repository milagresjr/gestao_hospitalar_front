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
import { createReceita } from '@/services/receita'
import { useAuthStore } from '@/store/authStore'
import type { ConsultaType, FarmacoType } from '@/types'
import Alert from '@/utils/alert'
import { useEffect, useState } from 'react'
import api from '@/services/api'
import { Textarea } from '@/components/ui/textarea'

// Esquema de validação com Zod
const ReceitaSchema = z.object({
  farmaco_id: z.string().min(1, 'Selecione o fármaco'),
  vezes_por_dia: z.number().min(1, 'Informe as vezes por dia'),
  qtd_por_dia: z.number().min(1, 'Informe a quantidade por dia'),
  descricao: z.string().min(1, 'Informe a descrição'),
//   data_emissao: z.string().min(1, 'Informe a data de emissão'),
})

type ReceitaFormData = z.infer<typeof ReceitaSchema>

interface ModalAddReceitaProps {
  isDialogOpen: boolean
  setIsDialogOpen: (value: boolean) => void
  consulta: ConsultaType | null
  onReceitaAdded: () => void
}

export default function ModalAddReceita({
  isDialogOpen,
  setIsDialogOpen,
  consulta,
  onReceitaAdded
}: ModalAddReceitaProps) {

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
    watch
  } = useForm<ReceitaFormData>({
    resolver: zodResolver(ReceitaSchema),
  })

  const { user } = useAuthStore()

  
  const [farmacos, setFarmacos] = useState<FarmacoType[]>([])

  const queryClient = useQueryClient()

  const { mutateAsync: createReceitaFn } = useMutation({
    mutationFn: createReceita,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['receitas'],
        exact: false,
      })
      onReceitaAdded()
    },
  })

    useEffect(() => {
      async function getFarmacos() {
        const response = await api.get('farmacos')
        setFarmacos(response.data.data)
      }
      getFarmacos()
    }, [])

  async function handleSubmitForm(data: ReceitaFormData) {
    try {
      await createReceitaFn({
        consulta_id: consulta?.consulta_id,
        profissional_saude_id: user?.usuario_id,
        ...data,
      })
      reset()
      closeDialog()
      Alert.success('Operação concluída!', 'Receita adicionada com sucesso.')
    } catch (error) {
      console.log('Erro ao adicionar receita', error)
    }
  }

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => setIsDialogOpen(open)}
    >
      <DialogContent className="sm:max-w-[425px] md:max-w-[700px]">
        <form onSubmit={handleSubmit(handleSubmitForm)}>
          <DialogHeader>
            <DialogTitle>Adicionar Receita</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="farmaco_id" className="text-right">
                Fármaco
              </Label>
              <div className="col-span-3">
                 <Select
                    value={watch('farmaco_id')?.toString() || ''}
                    onValueChange={value =>
                        setValue('farmaco_id', value.toString())
                    }
                    >
                    <SelectTrigger
                        className={`${errors.farmaco_id && 'border-red-500'} text-gray-400 dark:text-gray-300`}
                    >
                        <SelectValue placeholder="Fármacos disponíveis" />
                    </SelectTrigger>
                    <SelectContent>
                        {farmacos.map(item => (
                        <SelectItem
                            key={item.farmaco_id}
                            value={item.farmaco_id?.toString()}
                        >
                            {item.nome} - {item.dosagem}
                        </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                {errors.farmaco_id && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.farmaco_id.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="vezes_por_dia" className="text-right">
                Vezes por Dia
              </Label>
              <div className="col-span-3">
                <Input
                  id="vezes_por_dia"
                  {...register('vezes_por_dia', { valueAsNumber: true })}
                  className={errors.vezes_por_dia && 'border-red-500'}
                  type="number"
                />
                {errors.vezes_por_dia && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.vezes_por_dia.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="qtd_por_dia" className="text-right">
                Quantidade por Dia
              </Label>
              <div className="col-span-3">
                <Input
                  id="qtd_por_dia"
                  {...register('qtd_por_dia', { valueAsNumber: true })}
                  className={errors.qtd_por_dia && 'border-red-500'}
                  type="number"
                />
                {errors.qtd_por_dia && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.qtd_por_dia.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="descricao" className="text-right">
                Descrição
              </Label>
              <div className="col-span-3">
                <Textarea
                  id="descricao"
                  {...register('descricao')}
                  className={errors.descricao && 'border-red-500'}
                  type="text"
                />
                {errors.descricao && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.descricao.message}
                  </p>
                )}
              </div>
            </div>

          </div>
          <DialogFooter>
            <Button type="submit">Adicionar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
