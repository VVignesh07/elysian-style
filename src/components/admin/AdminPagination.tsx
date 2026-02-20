
import React from "react";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

interface AdminPaginationProps {
    currentPage: number;
    totalCount: number;
    pageSize: number;
    onPageChange: (page: number) => void;
}

const AdminPagination: React.FC<AdminPaginationProps> = ({
    currentPage,
    totalCount,
    pageSize,
    onPageChange,
}) => {
    const totalPages = Math.ceil(totalCount / pageSize);

    // Don't show anything if there are no records at all
    if (totalCount === 0) return null;

    const renderPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        const getPageLinkClass = (isActive: boolean) => cn(
            "h-8 w-8 text-xs font-medium transition-colors border-none",
            isActive
                ? "bg-[#EEF0FF] text-[#5551FF] hover:bg-[#EEF0FF] hover:text-[#5551FF]"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        );

        if (totalPages <= maxVisiblePages) {
            for (let i = 0; i < totalPages; i++) {
                pages.push(
                    <PaginationItem key={i}>
                        <PaginationLink
                            onClick={(e) => {
                                e.preventDefault();
                                onPageChange(i);
                            }}
                            isActive={currentPage === i}
                            className={getPageLinkClass(currentPage === i)}
                        >
                            {i + 1}
                        </PaginationLink>
                    </PaginationItem>
                );
            }
        } else {
            const startPage = Math.max(0, currentPage - 1);
            const endPage = Math.min(totalPages - 1, currentPage + 1);

            // Always show first page
            pages.push(
                <PaginationItem key={0}>
                    <PaginationLink
                        onClick={(e) => {
                            e.preventDefault();
                            onPageChange(0);
                        }}
                        isActive={currentPage === 0}
                        className={getPageLinkClass(currentPage === 0)}
                    >
                        1
                    </PaginationLink>
                </PaginationItem>
            );

            if (startPage > 1) {
                pages.push(
                    <PaginationItem key="ellipsis-1">
                        <PaginationEllipsis className="h-8 w-8 text-muted-foreground" />
                    </PaginationItem>
                );
            }

            // Show pages around current page
            for (let i = Math.max(1, startPage); i <= Math.min(totalPages - 2, endPage); i++) {
                pages.push(
                    <PaginationItem key={i}>
                        <PaginationLink
                            onClick={(e) => {
                                e.preventDefault();
                                onPageChange(i);
                            }}
                            isActive={currentPage === i}
                            className={getPageLinkClass(currentPage === i)}
                        >
                            {i + 1}
                        </PaginationLink>
                    </PaginationItem>
                );
            }

            if (endPage < totalPages - 2) {
                pages.push(
                    <PaginationItem key="ellipsis-2">
                        <PaginationEllipsis className="h-8 w-8 text-muted-foreground" />
                    </PaginationItem>
                );
            }

            // Always show last page
            pages.push(
                <PaginationItem key={totalPages - 1}>
                    <PaginationLink
                        onClick={(e) => {
                            e.preventDefault();
                            onPageChange(totalPages - 1);
                        }}
                        isActive={currentPage === totalPages - 1}
                        className={getPageLinkClass(currentPage === totalPages - 1)}
                    >
                        {totalPages}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        return pages;
    };

    return (
        <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/40">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest order-2 sm:order-1">
                Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalCount)} of {totalCount} records
            </p>
            {totalPages > 1 && (
                <Pagination className="order-1 sm:order-2 w-auto mx-0">
                    <PaginationContent className="gap-1">
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (currentPage > 0) onPageChange(currentPage - 1);
                                }}
                                className={cn(
                                    "h-8 w-8 p-0 flex items-center justify-center border-none transition-colors",
                                    currentPage === 0
                                        ? "opacity-30 cursor-not-allowed"
                                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                )}
                            />
                        </PaginationItem>

                        {renderPageNumbers()}

                        <PaginationItem>
                            <PaginationNext
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (currentPage < totalPages - 1) onPageChange(currentPage + 1);
                                }}
                                className={cn(
                                    "h-8 w-8 p-0 flex items-center justify-center border-none transition-colors",
                                    currentPage === totalPages - 1
                                        ? "opacity-30 cursor-not-allowed"
                                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                )}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </div>
    );
};

export default AdminPagination;
