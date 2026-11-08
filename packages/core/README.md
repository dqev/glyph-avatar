# glyph-avatars

Seeded geometric SVG avatars, plus a React avatar picker. Give it a user ID, email or name and it draws the same avatar every time, on the server or in the browser. No dependencies, about 8 KB gzipped.

- 32 glyph families, about 300 generated color pairs plus 14 curated ones, and 8 backdrops
- Pure SVG strings, so it works in React, Vue, Svelte, plain HTML, emails and image routes
- Frozen output: a given seed renders the same avatar in every `v1` release

## Install

```sh
npm install glyph-avatars
```

## Use

```js
import { createAvatar, avatarDataUri } from 'glyph-avatars';

el.innerHTML = createAvatar(user.id, { size: 40 });

const src = avatarDataUri(user.avatar ?? user.id);
```

## React

The package also has React components. React 18 or newer is needed only if you use them.

```jsx
import { Avatar, AvatarPicker } from 'glyph-avatars/react';

<Avatar value={user.avatar ?? user.id} size={32} />

<AvatarPicker
  defaultValue={user.avatar ?? user.id}
  onSave={(value) => updateUser({ avatar: value })}
  onCancel={() => setOpen(false)}
/>
```

The picker brings its own styles. It fills the width of its container, so put it on a settings page or inside your own dialog.

| Prop | Type | Default |
| --- | --- | --- |
| `defaultValue` | `string` | none; shown in the middle first |
| `colors` | `'generated' \| 'curated'` | `'generated'` |
| `title`, `description` | `string` | `'Choose an avatar'` and a short hint; pass `''` to hide |
| `saveLabel` | `string` | `'Save'` |
| `onSave` | `(value: string) => void` | receives the string to store |
| `onCancel` | `() => void` | shows a Cancel button when set |
| `onChange` | `(value: string) => void` | called on every change |
| `className` | `string` | added to the root; restyle with the `--ga-*` CSS variables |

### Saved avatars

People can tweak an avatar in the picker: change only its shape, colors or backdrop. The result is a short string such as `v1:xzl4n0g:mlda8xw:horizon`. Store it and pass it anywhere a seed goes:

```js
createAvatar(user.avatar ?? user.id, { size: 32 });
```

Strings that start with `v1:` are read as saved avatars. Anything else is a seed.

## API

| Function | Returns |
| --- | --- |
| `createAvatar(value, options?)` | SVG string |
| `buildAvatar(value, options?)` | `{ svg, glyph, palette, background }` |
| `avatarDataUri(value, options?)` | `data:image/svg+xml` URI |
| `stringifySpec(spec)` / `parseSpec(string)` / `toSpec(string)` | Convert between saved strings and `{ seed, colorSeed?, background?, colors? }` |

`value` is a seed, a saved `v1:` string or a spec object.

### Options

| Option | Type | Default |
| --- | --- | --- |
| `size` | `number` | `64` |
| `shape` | `'circle' \| 'square'` | `'circle'` |
| `radius` | `number` | `24` (square corners, out of 100) |
| `colors` | `'generated' \| 'curated'` | `'generated'` (ignored for saved `v1:` strings, which keep their own) |
| `glyph` | one of `GLYPH_NAMES` | from the seed |
| `background` | one of `BACKGROUNDS` | from the seed |
| `palette` | index into `PALETTES` or `{ name, bg, fg }` | from the seed |
| `title` | `string` | none; when set, the SVG gets `role="img"` and a `<title>` |

## Stability

Avatars are identity, so they must not drift. The test suite hashes thousands of seeds against a frozen `v1` fixture. Any change to what `v1` draws fails CI. New glyphs or colors ship under a new spec version.

## License

MIT
