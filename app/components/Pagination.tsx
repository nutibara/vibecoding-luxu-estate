import Link from "next/link";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
}

export default function Pagination({ currentPage, totalPages }: PaginationProps) {
    if (totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="mt-12 flex items-center justify-center gap-2">
            {/* Previous */}
            {currentPage > 1 ? (
                <Link
                    href={`?page=${currentPage - 1}`}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg bg-white border border-nordic-dark/10 text-nordic-dark hover:border-mosque hover:text-mosque font-medium text-sm transition-all hover:shadow-md"
                >
                    <span className="material-icons text-base">arrow_back</span>
                    Prev
                </Link>
            ) : (
                <span className="flex items-center gap-1 px-4 py-2 rounded-lg bg-white border border-nordic-dark/5 text-nordic-muted font-medium text-sm cursor-not-allowed opacity-50">
                    <span className="material-icons text-base">arrow_back</span>
                    Prev
                </span>
            )}

            {/* Page numbers */}
            <div className="flex items-center gap-1">
                {pages.map((page) => (
                    <Link
                        key={page}
                        href={`?page=${page}`}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${page === currentPage
                                ? "bg-nordic-dark text-white shadow-sm"
                                : "bg-white border border-nordic-dark/10 text-nordic-muted hover:text-nordic-dark hover:border-mosque/50 hover:bg-mosque/5"
                            }`}
                    >
                        {page}
                    </Link>
                ))}
            </div>

            {/* Next */}
            {currentPage < totalPages ? (
                <Link
                    href={`?page=${currentPage + 1}`}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg bg-white border border-nordic-dark/10 text-nordic-dark hover:border-mosque hover:text-mosque font-medium text-sm transition-all hover:shadow-md"
                >
                    Next
                    <span className="material-icons text-base">arrow_forward</span>
                </Link>
            ) : (
                <span className="flex items-center gap-1 px-4 py-2 rounded-lg bg-white border border-nordic-dark/5 text-nordic-muted font-medium text-sm cursor-not-allowed opacity-50">
                    Next
                    <span className="material-icons text-base">arrow_forward</span>
                </span>
            )}
        </div>
    );
}
