# Glyph Avatars

Seeded geometric avatars and a picker to choose them.

| Path | What it is |
| --- | --- |
| `packages/core` | `glyph-avatars` on npm. Draws avatars as SVG strings. No dependencies. |
| `packages/core/src/react` | `glyph-avatars/react`: the `Avatar` and `AvatarPicker` components. React is an optional peer dependency. |
| `apps/site` | Landing page. |
| `apps/playground` | Vite app that runs the React components against the core source. |

## Develop

```sh
npm install
npm test          # core tests, including the frozen v1 output check
npm run typecheck # core, playground and site
npm run dev       # playground at http://localhost:5173
npm run build     # build packages/core/dist
```

## Rules

- Never change what `v1` draws. `packages/core/test/v1-fixture.json` is the reference; a failing stability test means existing users' avatars would change.
- The React components import the core as `glyph-avatars`, so the built `react` entry reuses the core instead of bundling a second copy.
