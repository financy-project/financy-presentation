import { gql } from '@apollo/client'

export const CREATE_CATEGORY = gql`
  mutation CreateCategory($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      id
      title
      description
      icon
      color
    }
  }
`

export interface CreateCategoryInput {
  title: string
  description?: string | null
  icon: string
  color: string
}

export interface CreateCategoryData {
  createCategory: {
    id: string
    title: string
    description: string | null
    icon: string
    color: string
  }
}

export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($id: ID!, $input: UpdateCategoryInput!) {
    updateCategory(id: $id, input: $input) {
      id
      title
      description
      icon
      color
      transactionsQuantity
    }
  }
`

export interface UpdateCategoryInput {
  title?: string
  description?: string | null
  icon?: string
  color?: string
}

export interface UpdateCategoryData {
  updateCategory: {
    id: string
    title: string
    description: string | null
    icon: string
    color: string
    transactionsQuantity: number
  }
}

export const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id)
  }
`

export interface DeleteCategoryData {
  deleteCategory: boolean
}
