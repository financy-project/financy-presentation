### Phase 1: Foundation

- [x] F-001: Add `react-router-dom` as a dependency (`pnpm add react-router-dom`)
- [x] F-002: Add the shadcn `sonner` toast primitive (`pnpm dlx shadcn@latest add sonner`) — generates `src/components/ui/sonner.tsx` exporting `Toaster`
- [x] F-003: Wrap `<App />` with `<BrowserRouter>` in `src/main.tsx`
- [x] F-004: Create `src/pages/preview-page.tsx` exporting `PreviewPage(): JSX.Element` — move the current `App.tsx` body (`<CountriesList/>`, `<ContactForm/>`, `<ComponentsPreview/>` inside the existing `<main className="mx-auto flex max-w-2xl flex-col gap-6 p-6">` wrapper) into it verbatim
- [x] F-005: Rewrite `src/App.tsx` to render `<Toaster />` (from `@/components/ui/sonner`) plus `<Routes>`: `<Route path="/" element={<Navigate to="/cadastro" replace />} />`, `<Route path="/cadastro" element={<RegisterPage />} />`, `<Route path="/login" element={<LoginPage />} />`, `<Route path="/preview" element={<PreviewPage />} />`
- [x] F-006: Scaffold empty module directories: `src/modules/auth/pages/`, `src/modules/auth/components/`, `src/modules/auth/graphql/`, `src/modules/auth/hooks/`
