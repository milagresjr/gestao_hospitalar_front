// PaginationComponent.tsx
"use client";

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect } from "react"

interface PaginationComponentProps {
    currentPage: number
    itemsPerPage: number
    totalItems: number
    lastPage: number
    onPageChange: (page: number) => void
    onItemsPerPageChange: (value: number) => void
}

export function PaginationComponent({
    currentPage,
    itemsPerPage,
    totalItems,
    onPageChange,
    onItemsPerPageChange
}: PaginationComponentProps) {
    const totalPages = Math.ceil(totalItems / itemsPerPage)
    const startItem = (currentPage - 1) * itemsPerPage + 1
    const endItem = Math.min(currentPage * itemsPerPage, totalItems)

    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1)
        }
    }

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1)
        }
    }

    return (
        <div className="flex justify-between items-center p-4">
            <p className="text-gray-500 dark:text-gray-400">Mostrando {startItem}-{endItem} de {totalItems} itens</p>
            
            <div className="flex gap-3 items-center">
                <div className="flex items-center gap-2 w-[400px]">
                    <span className="text-gray-500 dark:text-gray-400">Itens por página</span>
                    <Select
                        value={String(itemsPerPage)}
                        onValueChange={(value) => onItemsPerPageChange(Number(value))}
                    >
                        <SelectTrigger className="w-20 !text-gray-500 !dark:text-gray-400">
                            <SelectValue placeholder="Itens" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem className="!text-gray-500 !dark:text-gray-400" value="10">10</SelectItem>
                            <SelectItem className="!text-gray-500 !dark:text-gray-400" value="20">20</SelectItem>
                            <SelectItem className="!text-gray-500 !dark:text-gray-400" value="50">50</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious 
                                href="#" 
                                onClick={handlePrevious}
                                aria-disabled={currentPage === 1}
                                className={currentPage === 1 ? "opacity-50 cursor-not-allowed" : undefined}
                            />
                        </PaginationItem>

                        {Array.from({ length: Math.min(totalPages, 5) }).map((_, index) => {
                            const page = index + 1
                            return (
                                <PaginationItem key={page}>
                                    <PaginationLink
                                        href="#"
                                        isActive={page === currentPage}
                                        onClick={() => onPageChange(page)}
                                        className={`text-gray-500 dark:text-gray-400 ${page === currentPage ? 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-600' : ''}`}
                                    >
                                        {page}
                                    </PaginationLink>
                                </PaginationItem>
                            )
                        })}

                        {totalPages > 5 && <PaginationItem>
                            <PaginationEllipsis />
                        </PaginationItem>}

                        <PaginationItem>
                            <PaginationNext 
                                href="#" 
                                onClick={handleNext}
                                aria-disabled={currentPage === totalPages}
                                className={currentPage === totalPages ? "opacity-50 cursor-not-allowed" : undefined}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    )
}