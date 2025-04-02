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
import { createInternamento } from '@/services/internamento'
import { useAuthStore } from '@/store/authStore'
import type { PacienteType, ConsultaType, CamaType } from '@/types'
import Alert from '@/utils/alert'
import { Textarea } from '@/components/ui/textarea'
import { useEffect, useState } from 'react'
import api from '@/services/api'

// Esquema de validação com Zod
const InternamentoSchema = z.object({
    data_prevista_alta: z.string().optional(),
    // usuario_id: z.string().optional(),
    cama_id: z.string().optional(),
    diagnostico: z.string().optional(),
    observacoes: z.string().optional(),
    motivo_internamento: z.string().optional(),
})

type InternamentoFormData = z.infer<typeof InternamentoSchema>

interface ModalEnviarInternamentoProps {
    isDialogOpen: boolean
    setIsDialogOpen: (value: boolean) => void
    paciente: PacienteType | undefined
    consulta: ConsultaType | null
    onInternamentoAdded: () => void
}

export default function ModalEnviarInternamento({
    isDialogOpen,
    setIsDialogOpen,
    paciente,
    consulta,
    onInternamentoAdded
}: ModalEnviarInternamentoProps) {

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
    } = useForm<InternamentoFormData>({
        resolver: zodResolver(InternamentoSchema),
    })

    const { user } = useAuthStore()

    const [camas, setCamas] = useState<
    CamaType[]
    >([])

    useEffect(() => {
    async function getCamas() {
        const response = await api.get('camas')
        setCamas(response.data.data)
    }
    getCamas()
    }, [])

    const queryClient = useQueryClient()

    const { mutateAsync: createInternamentoFn } = useMutation({
        mutationFn: createInternamento,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['internamento'],
                exact: false,
            })
        },
    })

    async function handleSubmitForm(data: InternamentoFormData) {
        try {
            await createInternamentoFn({
                data_prevista_alta: data.data_prevista_alta,
                motivo_internamento: data.motivo_internamento,
                cama_id: data.cama_id,
                diagnostico: data.diagnostico,
                observacoes: data.observacoes,
                paciente_id: paciente?.paciente_id,
                consulta_id: consulta?.consulta_id,
                profissional_saude_id: user?.usuario_id,
                // usuario_id: user?.usuario_id,
            })
            reset()
            closeDialog()
            onInternamentoAdded()
            Alert.success('Operação concluída!', 'Internamento realizado com sucesso.')
        } catch (error) {
            console.log('Erro ao enviar internamento', error)
        }
    }

    return (
        <>
            <Dialog
                open={isDialogOpen}
                onOpenChange={(open) => {
                    setIsDialogOpen(open)
                }}
            >
                <DialogContent className="sm:max-w-[425px] md:max-w-[700px]">
                    <form onSubmit={handleSubmit(handleSubmitForm)}>
                        <DialogHeader>
                            <DialogTitle>Enviar Internamento</DialogTitle>
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
                                <Label htmlFor="motivo_internamento" className="text-right">
                                    Motivo do Internamento
                                </Label>
                                <div className="col-span-3">
                                    <Input
                                        id="motivo_internamento"
                                        {...register('motivo_internamento')}
                                        className={errors.motivo_internamento && 'border-red-500'}
                                        type="text"
                                    />
                                    {errors.motivo_internamento && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.motivo_internamento.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="diagnostico" className="text-right">
                                    Diagnóstico
                                </Label>
                                <div className="col-span-3">
                                    <Input
                                        id="diagnostico"
                                        {...register('diagnostico')}
                                        className={errors.diagnostico && 'border-red-500'}
                                        type="text"
                                    />
                                    {errors.diagnostico && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.diagnostico.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="cama_id" className="text-right">
                                    Cama
                                </Label>
                                <div className="col-span-3">
                                <Select
                                    value={watch('cama_id')?.toString() || ''}
                                    onValueChange={value =>
                                    setValue('cama_id', value.toString())
                                    }
                                >
                                    <SelectTrigger
                                    className={`${errors.cama_id && 'border-red-500'} text-gray-400 dark:text-gray-300`}
                                    >
                                    <SelectValue placeholder="Selecione a cama" />
                                    </SelectTrigger>
                                    <SelectContent>
                                    {camas.map((item: CamaType) => (
                                        <SelectItem
                                        key={item.cama_id}
                                        value={item.cama_id?.toString()}
                                        >
                                        {item.descricao} - 
                                        {item.sala && item.sala.descricao}
                                        </SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                                    {errors.cama_id && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.cama_id.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="data_prevista_alta" className="text-right">
                                    Data Prevista de Alta
                                </Label>
                                <div className="col-span-3">
                                    <Input
                                        id="data_prevista_alta"
                                        {...register('data_prevista_alta')}
                                        className={errors.data_prevista_alta && 'border-red-500'}
                                        type="date"
                                    />
                                    {errors.data_prevista_alta && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.data_prevista_alta.message}
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
                            <Button type="submit">Enviar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}
