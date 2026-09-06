import {
  BaggageClaim,
  BookOpen,
  BriefcaseBusiness,
  CarFront,
  Dumbbell,
  Gift,
  HeartPulse,
  House,
  Mailbox,
  PawPrint,
  PiggyBank,
  ReceiptText,
  ShoppingCart,
  Tag as TagIcon,
  Ticket,
  ToolCase,
  Utensils,
  type LucideIcon,
} from 'lucide-react'
import type { TagColor } from '@/components/ui/tag'

// Single source of truth for a category's icon/color, shared by every
// place in the app that creates, edits, or just displays one: the
// categories module's IconPicker/ColorPicker, CategoryCard,
// CategoriesSummary, the transactions table's category cell, and the
// dashboard's recent-transactions row. Previously duplicated
// independently in each of those (module-isolation precedent taken too
// far for data this small and this widely read) — centralized here since
// it's plain data/lookup logic, not domain business logic.

export const CATEGORY_ICON_OPTIONS = [
  { name: 'BriefcaseBusiness', icon: BriefcaseBusiness },
  { name: 'CarFront', icon: CarFront },
  { name: 'HeartPulse', icon: HeartPulse },
  { name: 'PiggyBank', icon: PiggyBank },
  { name: 'ShoppingCart', icon: ShoppingCart },
  { name: 'Ticket', icon: Ticket },
  { name: 'ToolCase', icon: ToolCase },
  { name: 'Utensils', icon: Utensils },
  { name: 'PawPrint', icon: PawPrint },
  { name: 'House', icon: House },
  { name: 'Gift', icon: Gift },
  { name: 'Dumbbell', icon: Dumbbell },
  { name: 'BookOpen', icon: BookOpen },
  { name: 'BaggageClaim', icon: BaggageClaim },
  { name: 'Mailbox', icon: Mailbox },
  { name: 'ReceiptText', icon: ReceiptText },
] as const

// className is the swatch/preview color used only by ColorPicker; every
// other consumer only needs name+value.
export const CATEGORY_COLOR_OPTIONS: readonly { name: TagColor; value: string; className: string }[] = [
  { name: 'green', value: '#16A34A', className: 'bg-green-base' },
  { name: 'blue', value: '#2563EB', className: 'bg-blue-base' },
  { name: 'purple', value: '#9333EA', className: 'bg-purple-base' },
  { name: 'pink', value: '#DB2777', className: 'bg-pink-base' },
  { name: 'red', value: '#DC2626', className: 'bg-red-base' },
  { name: 'orange', value: '#EA580C', className: 'bg-orange-base' },
  { name: 'yellow', value: '#CA8A04', className: 'bg-yellow-base' },
]

export function resolveCategoryIcon(iconName?: string | null): LucideIcon {
  return CATEGORY_ICON_OPTIONS.find((option) => option.name === iconName)?.icon ?? TagIcon
}

export function resolveCategoryColorName(colorHex?: string | null): TagColor {
  return (
    CATEGORY_COLOR_OPTIONS.find((option) => option.value.toLowerCase() === colorHex?.toLowerCase())
      ?.name ?? 'blue'
  )
}

// bg-{color}-light + text-{color}-base — the icon-square treatment shared
// by CategoryCard, TransactionCategoryCell, and DashboardTransactionRow.
// Written out in full (not templated) so Tailwind's class scanner can find
// every class — template-interpolated class names are invisible to it.
export const CATEGORY_ICON_SQUARE_CLASSES: Record<TagColor, string> = {
  blue: 'bg-blue-light text-blue-base',
  purple: 'bg-purple-light text-purple-base',
  pink: 'bg-pink-light text-pink-base',
  red: 'bg-red-light text-red-base',
  orange: 'bg-orange-light text-orange-base',
  yellow: 'bg-yellow-light text-yellow-base',
  green: 'bg-green-light text-green-base',
}
