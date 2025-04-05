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
import { createInternamento, updateInternamento } from '@/services/internamento'
import { useAuthStore } from '@/store/authStore'
import type { PacienteType, ConsultaType, CamaType, InternamentoType } from '@/types'
import Alert from '@/utils/alert'
import { Textarea } from '@/components/ui/textarea'
import { useEffect, useState } from 'react'
import api from '@/services/api'

// Esquema de validação com Zod
const InternamentoSchema = z.object({
    cama_id: z.string().optional(),
})

type InternamentoFormData = z.infer<typeof InternamentoSchema>

interface ModalMudarCamaProps {
    isDialogOpen: boolean
    setIsDialogOpen: (value: boolean) => void
    internamento: InternamentoType | null
    onCamaChanged: () => void
}

export default function ModalMudarCama({
    isDialogOpen,
    setIsDialogOpen,
    onCamaChanged,
    internamento
}: ModalMudarCamaProps) {

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

    const [camas, setCamas] = useState<CamaType[]>([])


    useEffect(() => {
        async function getCamas() {
            const response = await api.get('camas')
            const camasFiltered = response.data.data.filter((cama: CamaType) => {
                return cama.cama_id !== internamento?.cama_id
            })
            setCamas(camasFiltered)
        }
        getCamas()
    }, [internamento])

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

    async function handleSubmitForm(data: InternamentoFormData) {
        try {
            await updateInternamentoFn({
                internamento_id: internamento?.internamento_id,
                cama_id: data.cama_id,
            })
            reset()
            closeDialog()
            onCamaChanged()
            Alert.success('Operação concluída!', 'Cama alterada com sucesso.')
        } catch (error) {
            console.log('Erro ao mudar de cama', error)
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
                            <DialogTitle>Mudar de Cama</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="paciente_id" className="text-right">
                                    Paciente
                                </Label>
                                <div className="col-span-3">
                                <Input
                                    disabled
                                    type="text"
                                    value={internamento?.paciente.nome}
                                    />
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
                                    <SelectValue placeholder="Camas disponiveis" />
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
                            

                        </div>
                        <DialogFooter>
                            <Button type="submit">Salvar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

        </>
    )
}
