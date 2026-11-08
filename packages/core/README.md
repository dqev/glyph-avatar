# glyph-avatars

Turn any text into an avatar. The same text always gets the same avatar.

```sh
npm install glyph-avatars
```

```js
import { createAvatar, avatarDataUri } from 'glyph-avatars';

el.innerHTML = createAvatar(user.id, { size: 40 });
img.src = avatarDataUri(user.id);
```

- Plain SVG strings, no dependencies. Works in the browser and on the server.
- 32 shapes, 8 backgrounds and about 300 color sets.
- Stable output: the same text draws the same avatar in every `v1` release.

For React components and an avatar picker, see [`@glyph-avatars/react`](https://www.npmjs.com/package/@glyph-avatars/react).

Options, the full API and how to save picked avatars are in the [README on GitHub](https://github.com/nilbuild/glyph-avatars#readme).

## License

MIT
