import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { IconButton } from "@/components/ui/icon-button"
import { cn } from "@/lib/utils"

type PaginationProps = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  disabled?: boolean
  className?: string
}

const VISIBLE_PAGE_COUNT = 3

// Slides a window of VISIBLE_PAGE_COUNT page numbers to keep `page` in view,
// clamped so the window never runs past the first/last page.
function getVisiblePages(page: number, totalPages: number): number[] {
  if (totalPages <= VISIBLE_PAGE_COUNT) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const start = Math.min(
    Math.max(1, page - 1),
    totalPages - VISIBLE_PAGE_COUNT + 1
  )

  return Array.from({ length: VISIBLE_PAGE_COUNT }, (_, i) => start + i)
}

function Pagination({ page, totalPages, onPageChange, disabled = false, className }: PaginationProps) {
  const pages = getVisiblePages(page, totalPages)

  return (
    <nav
      data-slot="pagination"
      className={cn("flex items-center gap-1", className)}
      aria-label="Paginação"
    >
      <IconButton
        variant="outline"
        className="border-gray-300"
        icon={<ChevronLeft />}
        aria-label="Página anterior"
        disabled={disabled || page === 1}
        onClick={() => onPageChange(page - 1)}
      />
      {pages.map((p) => (
        <Button
          key={p}
          variant={p === page ? "default" : "ghost"}
          size="icon"
          disabled={disabled}
          onClick={() => onPageChange(p)}
        >
          {p}
        </Button>
      ))}
      <IconButton
        variant="outline"
        className="border-gray-300"
        icon={<ChevronRight />}
        aria-label="Próxima página"
        disabled={disabled || page === totalPages}
        onClick={() => onPageChange(page + 1)}
      />
    </nav>
  )
}

export { Pagination }
export type { PaginationProps }
