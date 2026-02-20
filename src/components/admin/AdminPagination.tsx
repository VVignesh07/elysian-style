
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

    if (totalPages <= 1) return null;

    const renderPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

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
                            className={`cursor-pointer rounded-lg ${currentPage === i
                                    ? "bg-luxury-gold text-white border-luxury-gold hover:bg-luxury-gold/90"
                                    : "text-muted-foreground hover:bg-luxury-gold/5 hover:text-luxury-gold"
                                }`}
                        >
                            {i + 1}
                        </PaginationLink>
                    </PaginationItem>
                );
            }
        } else {
            // Logic for more than 5 pages with ellipses
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
                        className={`cursor-pointer rounded-lg ${currentPage === 0
                                ? "bg-luxury-gold text-white border-luxury-gold hover:bg-luxury-gold/90"
                                : "text-muted-foreground hover:bg-luxury-gold/10 hover:text-luxury-gold"
                            }`}
                    >
                        1
                    </PaginationLink>
                </PaginationItem>
            );

            if (startPage > 1) {
                pages.push(
                    <PaginationItem key="ellipsis-1">
                        <PaginationEllipsis />
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
                            className={`cursor-pointer rounded-lg ${currentPage === i
                                    ? "bg-luxury-gold text-white border-luxury-gold hover:bg-luxury-gold/90"
                                    : "text-muted-foreground hover:bg-luxury-gold/10 hover:text-luxury-gold"
                                }`}
                        >
                            {i + 1}
                        </PaginationLink>
                    </PaginationItem>
                );
            }

            if (endPage < totalPages - 2) {
                pages.push(
                    <PaginationItem key="ellipsis-2">
                        <PaginationEllipsis />
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
                        className={`cursor-pointer rounded-lg ${currentPage === totalPages - 1
                                ? "bg-luxury-gold text-white border-luxury-gold hover:bg-luxury-gold/90"
                                : "text-muted-foreground hover:bg-luxury-gold/10 hover:text-luxury-gold"
                            }`}
                    >
                        {totalPages}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        return pages;
    };

    return (
        <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest order-2 sm:order-1">
                Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalCount)} of {totalCount} records
            </p>
            <Pagination className="order-1 sm:order-2 w-auto mx-0">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={(e) => {
                                e.preventDefault();
                                if (currentPage > 0) onPageChange(currentPage - 1);
                            }}
                            className={`cursor-pointer rounded-lg ${currentPage === 0
                                    ? "opacity-50 cursor-not-allowed"
                                    : "hover:bg-luxury-gold/10 hover:text-luxury-gold"
                                }`}
                        />
                    </PaginationItem>
                    {renderPageNumbers()}
                    <PaginationItem>
                        <PaginationNext
                            onClick={(e) => {
                                e.preventDefault();
                                if (currentPage < totalPages - 1) onPageChange(currentPage + 1);
                            }}
                            className={`cursor-pointer rounded-lg ${currentPage === totalPages - 1
                                    ? "opacity-50 cursor-not-allowed"
                                    : "hover:bg-luxury-gold/10 hover:text-luxury-gold"
                                }`}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
};

export default AdminPagination;
