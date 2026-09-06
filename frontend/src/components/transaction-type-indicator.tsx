import { CircleArrowDown, CircleArrowUp } from "lucide-react"

import { cn } from "@/lib/utils"

type TransactionType = "income" | "expense"

type TransactionTypeIndicatorProps = {
  type: TransactionType
}

const config: Record<TransactionType, { label: string; icon: typeof CircleArrowUp; className: string }> = {
  income: { label: "Entrada", icon: CircleArrowUp, className: "text-green-dark" },
  expense: { label: "Saída", icon: CircleArrowDown, className: "text-red-dark" },
}

function TransactionTypeIndicator({ type }: TransactionTypeIndicatorProps) {
  const { label, icon: Icon, className } = config[type]

  return (
    <span
      data-slot="transaction-type-indicator"
      className={cn("inline-flex items-center gap-1.5 text-sm font-medium", className)}
    >
      <Icon className="size-4" />
      {label}
    </span>
  )
}

export { TransactionTypeIndicator }
export type { TransactionType, TransactionTypeIndicatorProps }
