# glyph-avatar

Turn any text into an avatar. The same text always gets the same avatar.

Try it at [kamran.fyi/glyph-avatar](https://kamran.fyi/glyph-avatar).

<img src=".github/banner.svg" width="100%" alt="A honeycomb of glyph avatars with the selected one ringed in the middle">

Pass in a name, an email, an ID or any other text, and get back an SVG. It has no dependencies, runs in the browser and on the server, and comes with React components, including a picker so people can choose their own.

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

`createAvatar` returns an SVG string. `avatarDataUri` returns the same SVG as a data URI, for an `<img>`, a CSS background or an email.

### Options

Both take the same options as a second argument.

| Option | Default | What it does |
| --- | --- | --- |
| `size` | `64` | Width and height in pixels. |
| `shape` | `'circle'` | `'circle'` or `'square'`. |
| `radius` | `24` | Corner radius of a `'square'`, out of 100. |
| `colors` | `'generated'` | `'generated'` picks from about 300 color sets, `'curated'` from 14 hand-picked ones. |
| `glyph` | from the text | Always draw this shape. Names are in `GLYPH_NAMES`. |
| `glyphs` | all 32 | Only pick from these shapes. |
| `background` | from the text | Always use this background. Names are in `BACKGROUNDS`. |
| `backgrounds` | all 8 | Only pick from these backgrounds. |
| `palette` | from the text | An index into `PALETTES`, or your own `{ name, bg, fg }`. |
| `title` | none | Adds a title for screen readers. Without it, the SVG is hidden from them. |

```js
createAvatar('maya@studio.dev', {
  size: 48,
  shape: 'square',
  glyphs: ['flower', 'moon', 'spiral'],
  title: 'Maya',
});
```

### More details

`buildAvatar` returns what was drawn as well as the SVG:

```js
import { buildAvatar } from 'glyph-avatar';

const { svg, glyph, background, palette } = buildAvatar(user.id);
```

`palette.bg` is handy for tinting the card or page around the avatar.

## React

The React components come with the same package:

```jsx
import { Avatar, AvatarPicker } from 'glyph-avatar/react';

<Avatar value={user.avatar ?? user.id} size={32} />

<AvatarPicker
  defaultValue={user.avatar ?? user.id}
  onSave={(value) => updateUser({ avatar: value })}
  onCancel={() => setOpen(false)}
/>
```

React 18 or newer is needed for these. If you only import from `glyph-avatar`, React isn't needed at all.

### Avatar

| Prop | Default | What it does |
| --- | --- | --- |
| `value` | required | The text, or a saved value from the picker. |
| `size` | `40` | Width and height in pixels. |
| `alt` | none | Text for screen readers. |
| `className`, `style` | none | Passed to the wrapping `<span>`. |

It also takes every option above except `title`, such as `shape` or `colors`.

### AvatarPicker

People drag, swipe or use the arrow keys to look around a honeycomb of avatars, and pick one. Buttons below it change the shape, the colors or the background of the one they picked, or shuffle the whole set.

The picker fills the width of its container, so you can put it on a page, in a popover or inside your own dialog. It brings its own styles.

| Prop | Default | What it does |
| --- | --- | --- |
| `defaultValue` | random | The avatar to start on. Pass the saved value, or the user's ID. |
| `onSave` | none | Called with the value to store when they press Save. |
| `onCancel` | none | Shows a Cancel button and calls this when it's pressed. |
| `onChange` | none | Called with the value every time the choice changes. |
| `colors` | `'generated'` | `'generated'` or `'curated'`. |
| `title` | `'Choose an avatar'` | Heading above the picker. Pass `''` to hide it. |
| `description` | `'Drag to look around, then pick one you like.'` | Line under the heading. Pass `''` to hide it. |
| `saveLabel` | `'Save'` | Label of the Save button. |
| `className` | none | Added to the picker's outer element. |

To match your app, set these CSS variables on the `className` you pass:

```css
.my-picker {
  --ga-panel: #ffffff;
  --ga-ink: #18181b;
  --ga-muted: #71717a;
}
```

## Saving a picked avatar

The picker gives you a short string like `v1:xzl4n0g:mlda8xw:horizon`. Store it with the user, and pass it anywhere you'd pass text:

```js
createAvatar(user.avatar ?? user.id);
```

People who never pick one still get an avatar from their ID.

Not using React? `stringifySpec` and `parseSpec` make and read the same strings, so you can build your own picker on top of `createAvatar`.

```js
import { stringifySpec, parseSpec } from 'glyph-avatar';

const value = stringifySpec({ seed: 'maya', background: 'ring' });
parseSpec(value); // { seed: 'maya', background: 'ring' }
```

## Stable output

The same text draws the same avatar in every `v1` release, so avatars don't change under people when you update. Saved strings start with `v1:` for the same reason.

## What it draws

32 shapes, 8 backgrounds and about 300 color sets, for around 3.8 million different avatars.

<img src=".github/shapes.svg" width="560" alt="One avatar for each of the 32 shapes">

## License

MIT © [Kamran Ahmed](https://kamran.fyi)
