# HELIOS_DECK — Rubric Checklist

Self-evaluation checklist to review before final submission.
Mark each item: ✅ done · ⚠️ partial · ❌ missing

---

## 1. Structure and Organization

- [ ] Clear folder structure with logical separation of concerns
- [ ] No files in the project root that should be in subdirectories
- [ ] Route modules are self-contained (loader + action + component in one file)
- [ ] Services layer is completely free of React imports
- [ ] No circular dependencies between layers
- [ ] `docs/` folder is complete and up to date

---

## 2. Content and Functionality

- [ ] At least one real data signal displayed from a live API
- [ ] Data is stored in SQLite (not fetched on every page load)
- [ ] Loading states visible while data is being prepared
- [ ] Error states visible when a signal fails to load
- [ ] Dashboard is responsive on mobile, tablet, and desktop
- [ ] No broken links or empty pages
- [ ] All widgets display units alongside values
- [ ] Historical data visible (not just the latest value)

---

## 3. Security

- [ ] No API keys or secrets in source code or git history
- [ ] `.env` is in `.gitignore` and never committed
- [ ] No `eval()` or `innerHTML` assignments with untrusted data
- [ ] User inputs (Phase 4) are validated server-side before DB writes
- [ ] HTTP headers: no sensitive data exposed in responses
- [ ] Dependencies checked for known vulnerabilities (`npm audit`)

---

## 4. Performance

- [ ] Lighthouse Performance score ≥ 90 on the dashboard route
- [ ] No layout shift (CLS < 0.1)
- [ ] Images use WebP or AVIF format
- [ ] No render-blocking resources in `<head>`
- [ ] SQLite queries use indexed columns for all WHERE clauses
- [ ] No N+1 query patterns in loaders
- [ ] Bundle size reviewed — no unnecessary large dependencies

---

## 5. CSS Quality

- [ ] Tailwind used consistently — no inline `style` attributes for layout
- [ ] No magic numbers in spacing (use Tailwind scale)
- [ ] Dark mode works (system preference respected)
- [ ] No horizontal overflow on any viewport width
- [ ] Typography is consistent: font family, size scale, line height
- [ ] Color palette is limited and coherent (not random colors per component)
- [ ] Focus states are visible for all interactive elements (accessibility)

---

## 6. JavaScript Quality

- [ ] ES modules throughout (`import`/`export`, no `require`)
- [ ] `async/await` used for all async operations
- [ ] Every `async` function has a `try/catch`
- [ ] No `var` — only `const` and `let`
- [ ] No `console.log`, `alert`, or `debugger` in committed files
- [ ] No magic strings — signal names and source IDs are constants
- [ ] Normalizers return `[]` on unexpected input (no throws to the caller)
- [ ] Validation at all system boundaries (API response, form data)
- [ ] No fetch calls inside React components

---

## 7. Git Discipline

- [ ] Commits are small and atomic (one logical change per commit)
- [ ] Commit messages follow `type(scope): description` format
- [ ] No `.env` files, credentials, or build artifacts in git history
- [ ] No large binary files committed
- [ ] Branch strategy is clear (feature branches or main-only with tags)
- [ ] No force-pushed commits on main

---

## 8. Design and Visual Coherence

- [ ] The project has a recognizable visual identity (not generic Bootstrap/shadcn defaults)
- [ ] Color palette reflects the space/observatory theme
- [ ] Typography choices are intentional, not default browser fonts
- [ ] Widgets have consistent sizing and spacing
- [ ] Data is always the visual hero — decorative elements support, not distract
- [ ] Responsive breakpoints are tested at 375px, 768px, 1280px, 1920px

---

## 9. Originality and Technical Depth

- [ ] The data pipeline is custom (not a third-party widget embed)
- [ ] At least one technically interesting implementation decision is documented
- [ ] The project goes beyond a CRUD app — it processes and contextualizes data
- [ ] `docs/decisions.md` shows real engineering judgment
- [ ] AI usage is documented and all code can be explained line by line

---

## 10. Documentation and Coherence

- [ ] `README.md` is accurate and covers setup, run, and test commands
- [ ] `docs/` accurately reflects the current state of the codebase
- [ ] `docs/ai-usage.md` is complete with all session logs
- [ ] `docs/data-contract.md` matches the actual `SignalRecord` implementation
- [ ] `CLAUDE.md` rules were followed throughout development
- [ ] No contradictions between documentation and code

---

## Final Gate

Before submitting, run through this list one final time with fresh eyes.
If any ❌ exists in sections 3 (Security) or 6 (JavaScript Quality), do not submit.
