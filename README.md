<img src=".github/assets/logo.svg" width="96" height="96" align="left" alt="">

# glyph-avatars

Turn any text into an avatar. The same text always gets the same avatar.

[![npm](https://img.shields.io/badge/npm-glyph--avatars-cb3837?logo=npm&logoColor=white)](https://www.npmjs.com/package/glyph-avatars)
[![React](https://img.shields.io/badge/react-%40glyph--avatars%2Freact-149eca?logo=react&logoColor=white)](https://www.npmjs.com/package/@glyph-avatars/react)
[![Dependencies](https://img.shields.io/badge/dependencies-0-2ea44f)](packages/core/package.json)
[![TypeScript](https://img.shields.io/badge/types-included-3178c6?logo=typescript&logoColor=white)](packages/core/src)
[![License](https://img.shields.io/badge/license-MIT-6e7681)](LICENSE)

<br clear="left">

<p align="center">
  <img src=".github/assets/banner.svg" width="100%" alt="A honeycomb of glyph avatars with the selected one ringed in the middle">
</p>

Pass in a name, an email, a user ID or anything else, and get back an SVG. It works in the browser and on the server, has no dependencies, and comes with an avatar picker for React.

- **Any text works.** No accounts, uploads or storage needed. `maya@studio.dev` always draws the same avatar.
- **Plain SVG.** Use it with React, Vue, Svelte, plain HTML, emails or image routes.
- **Lots of them.** 32 shapes, 8 backgrounds and about 300 color sets make around 3.8 million different avatars.
- **Stable.** The same text draws the same avatar in every `v1` release.

## Install

```sh
npm install glyph-avatars
```

## Usage

```js
import { createAvatar } from 'glyph-avatars';

const svg = createAvatar('maya@studio.dev');
```

`svg` is an SVG string. Put it anywhere you can put HTML:

```js
el.innerHTML = createAvatar(user.id, { size: 40 });
```

Or use it as an image:

```js
import { avatarDataUri } from 'glyph-avatars';

img.src = avatarDataUri(user.id);
```

### Options

```js
createAvatar(user.id, {
  size: 64,
  shape: 'square',
  radius: 24,
  colors: 'curated',
  glyph: 'flower',
  background: 'ring',
  title: 'Maya Chen',
});
```

| Option | Type | Default |
| --- | --- | --- |
| `size` | `number` | `64` |
| `shape` | `'circle' \| 'square'` | `'circle'` |
| `radius` | `number` | `24`. Corner radius for squares, out of 100. |
| `colors` | `'generated' \| 'curated'` | `'generated'`. Generated has about 300 color sets, curated has 14 hand-picked ones. |
| `glyph` | one of `GLYPH_NAMES` | picked from the text |
| `glyphs` | list of `GLYPH_NAMES` | all. Only pick from these shapes. |
| `background` | one of `BACKGROUNDS` | picked from the text |
| `backgrounds` | list of `BACKGROUNDS` | all. Only pick from these backgrounds. |
| `palette` | index into `PALETTES`, or `{ name, bg, fg }` | picked from the text |
| `colorSeed` | `string` | Pick colors from different text than the shape. |
| `title` | `string` | none. When set, the SVG gets `role="img"` and a `<title>` for screen readers. |

## React

```sh
npm install glyph-avatars @glyph-avatars/react
```

```jsx
import { Avatar } from '@glyph-avatars/react';

<Avatar value={user.id} size={32} />
```

`Avatar` takes the same options as `createAvatar`, plus `className`, `style` and `alt`.

### Avatar picker

Let people pick their own avatar. Drag around to find one, then change just its shape, colors or background.

```jsx
import { AvatarPicker } from '@glyph-avatars/react';

<AvatarPicker
  defaultValue={user.avatar ?? user.id}
  onSave={(value) => updateUser({ avatar: value })}
/>
```

It's a plain component that fills the width of its container. Put it on a settings page, in a popover, or inside your own dialog:

```jsx
<Dialog open={open}>
  <AvatarPicker
    defaultValue={user.avatar ?? user.id}
    onSave={(value) => {
      updateUser({ avatar: value });
      setOpen(false);
    }}
    onCancel={() => setOpen(false)}
  />
</Dialog>
```

| Prop | Type | Default |
| --- | --- | --- |
| `defaultValue` | `string` | Shown in the middle first. Pass the saved value or the user's ID. |
| `onSave` | `(value: string) => void` | Gets the value to store. |
| `onCancel` | `() => void` | Shows a Cancel button when set. |
| `onChange` | `(value: string) => void` | Called on every change. |
| `title` | `string` | `'Choose an avatar'`. Pass `''` to hide it. |
| `description` | `string` | A short hint. Pass `''` to hide it. |
| `saveLabel` | `string` | `'Save'` |
| `colors` | `'generated' \| 'curated'` | `'generated'` |
| `className` | `string` | Added to the root. Restyle it with the `--ga-*` CSS variables. |

The picker brings its own styles, so there's nothing else to import.

## Saving what people pick

The picker gives you a short string like `v1:xzl4n0g:mlda8xw:horizon`. Store it with the user, the same way you'd store a name. Then pass it anywhere you'd pass text:

```js
createAvatar(user.avatar ?? user.id);
```

```jsx
<Avatar value={user.avatar ?? user.id} />
```

People who never picked one still get an avatar from their ID, so you don't need to store anything for them.

## What it draws

<p align="center">
  <img src=".github/assets/shapes.svg" width="560" alt="One avatar for each of the 32 shapes">
</p>

Every shape comes out a little different each time, so two people who land on the same shape still look different.

## Not using React?

The picker is for React, but everything it uses is in `glyph-avatars`, so you can build your own:

| Function | Returns |
| --- | --- |
| `createAvatar(value, options?)` | SVG string |
| `avatarDataUri(value, options?)` | `data:image/svg+xml` URI |
| `buildAvatar(value, options?)` | `{ svg, glyph, palette, background }` |
| `stringifySpec(spec)` | The string to store, from `{ seed, colorSeed?, background?, colors? }` |
| `parseSpec(string)` | That object back, or `null` |
| `GLYPH_NAMES`, `BACKGROUNDS`, `PALETTES` | Every shape, background and curated color set |

To change only the colors, keep `seed` and set a new `colorSeed`. To change only the background, set `background`.

## License

MIT
