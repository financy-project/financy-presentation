import { gql } from '@apollo/client'

export const CREATE_TRANSACTION = gql`
  mutation CreateTransaction($input: CreateTransactionInput!) {
    createTransaction(input: $input) {
      id
      type
      description
      date
      value
      category {
        id
        title
        color
      }
    }
  }
`

export type TransactionKind = 'EXPENSE' | 'INCOME'

export interface CreateTransactionInput {
  type: TransactionKind
  description: string
  date: string // ISO 8601 — type-graphql's Date scalar (de)serializes to/from an ISO string over the wire
  value: number // Int, cents, must be >= 1 (server: Min(1))
  categoryId: string
}

export interface CreateTransactionData {
  createTransaction: {
    id: string
    type: TransactionKind
    description: string
    date: string
    value: number
    category: { id: string; title: string; color: string } | null
  }
}

export const UPDATE_TRANSACTION = gql`
  mutation UpdateTransaction($id: ID!, $input: UpdateTransactionInput!) {
    updateTransaction(id: $id, input: $input) {
      id
      type
      description
      date
      value
      category {
        id
        title
        color
      }
    }
  }
`

export interface UpdateTransactionInput {
  type?: TransactionKind
  description?: string
  date?: string
  value?: number
  categoryId?: string
}

export interface UpdateTransactionData {
  updateTransaction: {
    id: string
    type: TransactionKind
    description: string
    date: string
    value: number
    category: { id: string; title: string; color: string } | null
  }
}

export const DELETE_TRANSACTION = gql`
  mutation DeleteTransaction($id: ID!) {
    deleteTransaction(id: $id)
  }
`

export interface DeleteTransactionData {
  deleteTransaction: boolean
}
