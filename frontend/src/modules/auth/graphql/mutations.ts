import { gql } from '@apollo/client'

export const REGISTER_USER = gql`
  mutation RegisterUser($input: RegisterUserInput!) {
    registerUser(input: $input) {
      id
      email
      name
    }
  }
`

export interface RegisterUserInput {
  name: string
  email: string
  password: string
}

export interface RegisterUserData {
  registerUser: {
    id: string
    email: string
    name: string
  }
}

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      id
      email
      name
    }
  }
`

export interface LoginInput {
  email: string
  password: string
}

export interface LoginData {
  login: {
    id: string
    email: string
    name: string
  }
}

export const LOGOUT = gql`
  mutation Logout {
    logout
  }
`

export interface LogoutData {
  logout: boolean
}
