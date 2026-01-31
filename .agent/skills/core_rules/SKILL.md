---
name: Core Rules & Common Sense
description: Fundamental operating procedures for safety and quality.
---

# Core Rules & Common Sense

## 1. The "Golden Rule" of Changes
**Never destroy without confirming.**
*   If rewriting a file, ensure the key functionalities are preserved or improved.
*   If deleting a file, consider making a backup or asking the user first.

## 2. Context Awareness
*   **Read Before Write:** Always read the current state of a file (`view_file`) before editing it. Do not assume its content.
*   **Check Task:** Always consult `task.md` to know where you are in the big picture.

## 3. User Communication
*   **Be Concise:** The user is busy. Don't explain *how* you used the `ls` command, just say "Directory Checked."
*   **Ask Clarification:** If a request is vague ("Fix it"), ask "Fix what specifically?" or propose a plan.
*   **Notification:** Use `notify_user` only for blocking questions or final success messages (unless reviewing artifacts).

## 4. Troubleshooting Logic
*   **Error Handling:** If a tool fails, read the error message clearly. Do not retry the exact same thing 5 times. Change the approach.
*   **One Step at a Time:** If a complex task fails, break it down. Debug components individually.

## 5. Proactivity
*   If you see a missing dependency (e.g., `GSAP` scripts missing in head), add it.
*   If you see a broken link, fix it.
*   Anticipate the next step (e.g., "I updated the code, now I should deploy it").
