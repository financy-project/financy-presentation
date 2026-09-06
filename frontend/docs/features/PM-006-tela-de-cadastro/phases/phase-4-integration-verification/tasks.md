### Phase 4: Integration & Verification

- [x] F-014: `src/App.test.tsx`: renders `RegisterPage` at `/cadastro`, redirects `/` to `/cadastro`, renders `LoginPage` at `/login`, renders `PreviewPage` at `/preview` (using `MemoryRouter`/`initialEntries`)
- [x] F-015: Manual verification: `pnpm dev`, walk the happy path (fill form → submit → toast → redirect) and the duplicate-email path against a mocked/dev GraphQL response, confirm the Figma frame's visual details (logo, spacing, helper text, button copy) match
- [x] F-016: `pnpm lint`, `pnpm build`, `pnpm test` all pass
