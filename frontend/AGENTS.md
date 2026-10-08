# AGENTS.md

## Local development

- Backend (read-only in this repo): `../backend/`.
  Start it on the dev port with a runtime override, do not edit `.env`:
  `PORT=5055 node src/server.js`
- Frontend: `.` (the `frontend/` directory).
  `npm start` serves on `http://localhost:4200` and proxies `/api` to
  `http://localhost:5055` (see `proxy.conf.json`).
- API base URL is centralized in `src/environments/environment.ts` and exposed
  through the `API_BASE_URL` injection token. Do not hardcode hosts in code.
- Tests: `npx ng test --watch=false`. Build: `npx ng build`.

## Domain notes

- Auth uses `Authorization: Bearer <JWT>`. There is no cookie, no refresh token,
  and no backend logout endpoint. Client-side logout clears the local session.
- `GET /api/dashboard` requires the ADMIN role. The dashboard renders only the
  aggregate fields the endpoint returns. Do not fabricate metrics, trends, or
  recent activity.

<!-- antislop:start -->
## antislop
For UI, copy, people, mobile layout, or code comments work, read these installed skill files directly (use these paths even if a same-named global skill exists):
- Core filter, always on: `.opencode/skills/antislop/SKILL.md`
- UI / visual: `.opencode/skills/antislop-ui/SKILL.md`
- People / accessibility: `.opencode/skills/antislop-human/SKILL.md`
- Mobile / responsive: `.opencode/skills/antislop-layoutmobile/SKILL.md`
Before starting, follow the core's "Two Usage Modes" section in strict order: explicit session instruction first, then global preference, then ask. A session instruction always wins. For a resolved mode, say `antislop active: <mode> (session override).` or `antislop active: <mode> (global preference).` once before presenting findings or making edits, using the actual mode and source. Acknowledging the user's request without naming the source does not replace this notice.
Only an explicit choice of antislop during or after selects a session mode. A request to review, audit, or avoid file edits does not select a mode; read the global preference in that case. Another skill's mode does not select antislop's mode.
If the mode is unresolved, ask during/after and end the response; wait for the answer before any UI review, planning, or concept. For read-only tasks, put the active-mode notice only at the start of the final answer, never in progress messages. For editing tasks, announce before the first edit and omit it from the final answer.
To update antislop later: `npx antislop-ai --update`, or run `npx antislop-ai` and pick Overwrite them.
<!-- antislop:end -->
