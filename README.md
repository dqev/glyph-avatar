# glyph-avatar

Turn any text into an avatar. The same text always gets the same avatar.

Try it at [kamran.fyi/glyph-avatar](https://kamran.fyi/glyph-avatar).

<img src=".github/banner.svg" width="100%" alt="A honeycomb of glyph avatars with the selected one ringed in the middle">

Pass in a name, an email, an ID or any other text, and get back an SVG. No dependencies, works in the browser and on the server, and comes with an avatar picker for React.

## Install

```sh
npm install glyph-avatar
```

## Usage

```js
import { createAvatar, avatarDataUri } from 'glyph-avatar';

el.innerHTML = createAvatar(user.id, { size: 40 });
img.src = avatarDataUri(user.id);
```

| Option | Default |
| --- | --- |
| `size` | `64` |
| `shape` | `'circle'`, or `'square'` |
| `colors` | `'generated'` (about 300 color sets), or `'curated'` (14) |
| `glyph`, `background` | picked from the text |
| `title` | none. Adds a title for screen readers. |

## React

Run this to add the React components, including the avatar picker:

```sh
npm install glyph-avatar @glyph-avatar/react
```

```jsx
import { Avatar, AvatarPicker } from '@glyph-avatar/react';

<Avatar value={user.avatar ?? user.id} size={32} />

<AvatarPicker
  defaultValue={user.avatar ?? user.id}
  onSave={(value) => updateUser({ avatar: value })}
  onCancel={() => setOpen(false)}
/>
```

The picker fills its container, so put it on a page, in a popover or inside your own dialog. It brings its own styles.

It saves a short string like `v1:xzl4n0g:mlda8xw:horizon`. Store it with the user and pass it anywhere you'd pass text. People who never pick one still get an avatar from their ID.

Not using React? `createAvatar` gives you plain SVG, so you can build your own picker on top of it.

## What it draws

32 shapes, 8 backgrounds and about 300 color sets, for around 3.8 million different avatars.

<img src=".github/shapes.svg" width="560" alt="One avatar for each of the 32 shapes">

## License

MIT © [Kamran Ahmed](https://kamran.fyi)
