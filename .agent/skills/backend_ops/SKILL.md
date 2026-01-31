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
**CRITICAL: Filesystem Verification**
Before running `git push`, you MUST:
1.  **Identify Targets:** Explicitly list which files and folders are being staged/pushed.
2.  **Confirm Scope:** If the user hasn't explicitly authorized these specific paths, ASK for confirmation: "I am about to push changes to [Folder/File]. Proceed?"

**Standard Workflow:**
1.  `git status` (Check what's changed)
2.  `git add [specific_path]` (Avoid `git add .` unless confirming the entire root)
3.  `git commit -m "..."`
4.  `git push`

## 4. Verification Checklist
*   [ ] Does the build run locally? (if applicable)
*   [ ] Are all new files created?
*   [ ] Are external assets (images) in place?
*   [ ] Is the user aware of any manual steps (e.g., moving files)?
