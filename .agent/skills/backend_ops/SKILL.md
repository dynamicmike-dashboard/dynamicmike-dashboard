---
name: Backend Ops & Logistics
description: Rules for Database (Supabase) management and Deployment workflows.
---

# Backend Ops & Logistics

## 1. Database (Supabase)
*   **Row Level Security (RLS):** NEVER disable RLS on public tables (`ALTER TABLE x ENABLE ROW LEVEL SECURITY`). Always create policies for SELECT/INSERT/UPDATE.
*   **Types:** Updating the DB schema requires updating TypeScript interfaces (`types.ts` or `database.types.ts`).
*   **SQL Standards:** Use snake_case for table columns. Use UUIDs for primary keys.

## 2. File Organization
*   **Static Assets:** All images/videos go to `public/`.
    *   *Subfolders:* Group by project (e.g., `public/realai-pages/images/`).
    *   *References:* In HTML/Code, reference as `/realai-pages/images/file.png` (no `public` prefix).

## 3. Deployment Logistics (Git)
Before running `git push`:
1.  **Check Status:** `git status` to see what's changed.
2.  **Add Carefully:** `git add .` (if at root) or specific files. Avoid adding `node_modules` or `.env`.
3.  **Commit Messages:** Use Conventional Commits.
    *   `feat: Add new feature`
    *   `fix: Resolve bug`
    *   `chore: Maintenance/Refactor`
    *   `style: CSS/Animation updates`

## 4. Verification Checklist
*   [ ] Does the build run locally? (if applicable)
*   [ ] Are all new files created?
*   [ ] Are external assets (images) in place?
*   [ ] Is the user aware of any manual steps (e.g., moving files)?
