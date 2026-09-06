# tela-de-cadastro - PM-006

## Design Reference

Figma: https://www.figma.com/design/ZF0QlJlYLMEUz6DH93SwbK/Financy--Community-?node-id=3103-1916&t=knFQQPqdFUndj2pA-0

Frame "Cadastro" contents (checked visually in Figma):
- Logo (Financy wordmark)
- Heading: "Criar conta" / subtitle: "Comece a controlar suas finanças ainda hoje"
- Field "Nome completo" — placeholder "Seu nome completo", person icon
- Field "E-mail" — placeholder "mail@exemplo.com", envelope icon
- Field "Senha" — placeholder "Digite sua senha", lock icon, trailing show/hide toggle
- Helper text under password: "A senha deve ter no mínimo 8 caracteres"
- Primary button: "Cadastrar"
- Divider "ou"
- Text "Já tem uma conta?" + secondary button/link "Fazer login" (routes to the login screen)

## Description

Registration screen ("tela de cadastro") where a new user creates a Financy account by providing name, email, and password. Follows the Figma design linked above and must validate against the same rules enforced by the GraphQL API's `registerUser` mutation (`../server/src/modules/user/graphql/input-types/register-user.input.ts`), so client-side and server-side validation stay in sync.

## Users

- End users signing up for a new Financy account (unauthenticated visitors)

## Acceptance Criteria

* [ ] Form renders exactly as in the Figma frame: logo, "Criar conta" heading + subtitle, "Nome completo" / "E-mail" / "Senha" fields (with icons and placeholders as designed), password helper text, "Cadastrar" primary button, divider, and "Fazer login" link/button
* [ ] Password field has a show/hide toggle
* [ ] Name is required, 1–255 characters (mirrors `Length(1, 255)` server-side)
* [ ] Email must be a valid email format (mirrors `IsEmail`)
* [ ] Password must be at least 8 characters, contain at least one uppercase letter, and at least one number (mirrors `MinLength(8)` + `Matches` rules) — the "mínimo 8 caracteres" helper text from Figma is always visible under the field
* [ ] Submitting valid data calls the `registerUser` GraphQL mutation and, on success, navigates the user to the login screen (mutation returns `{ id, email, name }` only — no auth token, so there is no auto-login)
* [ ] Submitting an email that already exists surfaces the server's `UserAlreadyExistsError` (`errors.user_already_exists`) as a field-level or form-level error, not a generic failure
* [ ] Field-level validation errors from the server (`validations.email`, `validations.name_required`, `validations.password_min`, `validations.password_uppercase`, `validations.password_number`) are mapped to the corresponding form field
* [ ] Loading state is shown while the mutation is in flight; submit is disabled to prevent duplicate submissions
* [ ] "Fazer login" navigates to the login screen without submitting the form

## Out of Scope

- Auto-login / session creation after registration (not supported by the current `registerUser` mutation contract)
- Email verification flow
- Social login / OAuth
- Password reset / forgot password
