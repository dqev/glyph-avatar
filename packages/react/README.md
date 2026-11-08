# @glyph-avatar/react

React components for [glyph-avatar](https://www.npmjs.com/package/glyph-avatar): an `Avatar`, and a picker so people can choose their own.

```sh
npm install glyph-avatar @glyph-avatar/react
```

```jsx
import { Avatar, AvatarPicker } from '@glyph-avatar/react';

<Avatar value={user.avatar ?? user.id} size={32} />

<AvatarPicker
  defaultValue={user.avatar ?? user.id}
  onSave={(value) => updateUser({ avatar: value })}
/>
```

The picker fills the width of its container, so you can put it on a page, in a popover or inside your own dialog. It brings its own styles. It saves a short string like `v1:xzl4n0g:mlda8xw:horizon`; store it with the user and pass it to `Avatar`.

All props and options are in the [README on GitHub](https://github.com/nilbuild/glyph-avatar#readme).

## License

MIT © [Kamran Ahmed](https://kamran.fyi)
