"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createSala, deleteSala, fetchSalas, PaginatedSalas, updateSala } from "@/services/salas";
import { SalaType } from "@/types";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui_old/table";
import Badge from "@/components/ui_old/badge/Badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { PaginationComponent } from "@/components/ui_old/pagination/Pagination";


// Esquema de validação com Zod
const salaSchema = z.object({
    descricao: z.string().min(1, "A descrição é obrigatória"),
});

type salaFormData = z.infer<typeof salaSchema>;

export default function SalasTable() {

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedSala, setSelectedSala] = useState<SalaType | null>(null);
    const [salaToDelete, setSalaToDelete] = useState<SalaType | null >(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    function openDialog() {
        setIsDialogOpen(true);
    }
    function closeDialog() {
        setIsDialogOpen(false);
    }

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm<salaFormData>({
        resolver: zodResolver(salaSchema),
    });

    const { data: paginatedData, isLoading, error } = useQuery<PaginatedSalas>({
        queryKey: ["salas", currentPage, itemsPerPage],
        queryFn: () => fetchSalas({
            page: currentPage,
            per_page: itemsPerPage
        }),
    });

    const queryClient = useQueryClient();

    const { mutateAsync: createSalaFn } = useMutation({
        mutationFn: createSala,
        onSuccess: () => {
            // Invalidar todas as páginas
            queryClient.invalidateQueries({
                queryKey: ['salas'],
                exact: false
            });
        }
    });

    const { mutateAsync: updateSalaFn } = useMutation({
        mutationFn: updateSala,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['salas'],
                exact: false // Invalida TODAS as queries que começam com 'salas'
            });
        }
    });

    const { mutateAsync: deleteSalaFn } = useMutation({
        mutationFn: deleteSala,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['salas'],
                exact: false // Invalida TODAS as queries que começam com 'salas'
            });
        }
    });

    async function handleSubmitForm(data: salaFormData) {
        try {
            if (selectedSala) {
                console.log("Dados: ", selectedSala);
                await updateSalaFn({ sala_id: selectedSala.sala_id, ...data });
            } else {
                await createSalaFn({
                    descricao: data.descricao,
                    estado: '0'
                });
            }
            setSelectedSala(null);
            reset(); // Limpa o formulário após o envio
            closeDialog();
        } catch (error) {
            console.log("Erro ao cadastrar/editar nova sala", error);
        }
    }

    // Delete Handler
    async function handleDelete() {
        if (!salaToDelete) return;
        try {
            await deleteSalaFn((salaToDelete.sala_id ?? '') as string);
            setSalaToDelete(null);
        } catch (error) {
            console.log("Erro ao excluir sala");
        }
    }

    // Edit Handler
    function handleEdit(sala: SalaType) {
        setSelectedSala(sala);
        setValue("descricao", sala.descricao);
        setIsDialogOpen(true);
    }

    if (isLoading) return <p>Carregando...</p>;
    if (error) { console.log("ERROS: ", error); return <p>Erro ao carregar os dados</p>; }

    return (
        <>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">

                <div className="flex justify-end p-3">
                    <Dialog open={isDialogOpen} onOpenChange={(open) => {
                        if (!open) {
                            reset();
                            setSelectedSala(null);
                        }
                        setIsDialogOpen(open);
                    }}>
                        <DialogTrigger asChild>
                            <Button onClick={() => setIsDialogOpen(true)}>
                                <Plus />
                                Novo
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <form onSubmit={handleSubmit(handleSubmitForm)}>
                                <DialogHeader>
                                    <DialogTitle>
                                        {selectedSala ? "Editar Sala" : "Nova Sala"}
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="descricao" className="text-right">
                                            Descrição
                                        </Label>
                                        <div className="col-span-3">
                                            <Input
                                                id="descricao"
                                                {...register("descricao")}
                                                className={errors.descricao && "border-red-500"}
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
                                    <Button type="submit">
                                        {selectedSala ? "Salvar Alterações" : "Salvar"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    {/* Dialog de Confirmação de Exclusão */}
                    <Dialog open={!!salaToDelete} onOpenChange={(open) => !open && setSalaToDelete(null)}>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Confirmar Exclusão</DialogTitle>
                                <DialogDescription>
                                    Tem certeza que deseja excluir a sala {salaToDelete?.descricao}?
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setSalaToDelete(null)}>
                                    Cancelar
                                </Button>
                                <Button variant="destructive" onClick={handleDelete}>
                                    Confirmar Exclusão
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="max-w-full overflow-x-auto">

                    <div className="min-w-[1102px]">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-lg dark:text-gray-400">
                                        Descrição
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-lg dark:text-gray-400">
                                        Estado
                                    </TableCell>
                                </TableRow>
                            </TableHeader>

                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {paginatedData?.data.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                            {item.descricao}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                            <Badge size="sm" color={item.estado ? "success" : "error"}>
                                                {item.estado == '0' ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleEdit(item)}
                                                >
                                                    Editar
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => setSalaToDelete(item)}
                                                >
                                                    Excluir
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
                                onItemsPerPageChange={(value) => {
                                    setCurrentPage(1);
                                    setItemsPerPage(value);
                                }}
                            />
                        )}

                    </div>
                </div>
            </div>
        </>
    );
}
