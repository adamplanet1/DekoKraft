# Magic Web Rules

These rules guide future Codex work on DekoKraft CMS and Magic Web features.

## First Step In A New Session

Read this file and `MAGIC_WEB_ROADMAP.md` before making Magic Web changes.

## File Scope

- Modify only files requested by the user.
- Do not edit unrelated files.
- Do not create new components unless explicitly requested.
- Prefer small, safe patches.
- Preserve existing behavior unless the user asks to change it.

## Product Workflow Safety

- Do not connect backend unless explicitly requested.
- Do not save products unless explicitly requested.
- Do not save files unless explicitly requested.
- Do not make real AI calls unless explicitly requested.
- Do not generate images unless explicitly requested.
- Do not convert images to WebP unless explicitly requested.

## Localization

When changing product UI text, keep labels for:

- Arabic
- English
- German
- French

Arabic RTL support must remain intact.

## UI Guidelines

- Keep the admin UI clean, modern, and readable.
- Keep buttons clear and easy to click.
- Keep modal sections visually separated.
- Prefer reusable local UI patterns.
- Avoid adding heavy abstractions too early.

## Validation And Testing

- Run ESLint for changed files.
- If a TypeScript check is useful, run it and report unrelated existing errors separately.
- Do not fix unrelated lint/type errors unless requested.

## Current Magic Web Mode

The current product engine is prototype/local UI mode:

- local state only
- placeholders allowed
- no persistence
- no backend
- no AI
- no production publishing
