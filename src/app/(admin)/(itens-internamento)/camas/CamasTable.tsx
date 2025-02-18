"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCamas } from "@/services/camas";
import { CamaType } from "@/types";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Buttons from "../../(ui-elements)/buttons/page";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { useState } from "react";

export default function CamasTable() {

    const [openModal,setOpenModal] = useState(false);
    const { data, isLoading, error } = useQuery<CamaType[]>({
        queryKey: ["camas"],
        queryFn: fetchCamas,
    });

    console.log("Dados",data); // Verifique o formato dos dados retornados

    if (isLoading) return <p>Carregando...</p>;
    if (error) return <p>Erro ao carregar os dados</p>;

    function handleCloseModal() {
        setOpenModal(false);
    }
    function handleOpenModal() {
        setOpenModal(true);
    }

    return (
        <>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
                    <Button size="sm" onClick={handleOpenModal}>Novo</Button>
                <div className="min-w-[1102px]">
                    <Table>
                        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                            <TableRow>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Descrição
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Estado
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                    Opcs
                                </TableCell>
                            </TableRow>
                        </TableHeader>

                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {data?.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        {item.descricao}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        <Badge size="sm" color={item.estado ? "success" : "error"}>
                                            {item.estado ? "Active" : "Inactive"}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
        <Modal 
        isOpen={openModal}
        onClose={handleCloseModal}
        isFullscreen={false}
        className="p-5"
        >
            <h2>Testando Modal</h2>
        </Modal>
        </>
    );
}
