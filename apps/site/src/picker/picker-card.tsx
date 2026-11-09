import { useState } from 'react';
import { Code } from '../code';
import { CopyButton, copyIcon } from '../ui';
import { PLACES } from './places';
import './picker.css';

const PICKER_CODE = `import { AvatarPicker } from 'glyph-avatar/react'

<AvatarPicker
  defaultValue={user.avatar ?? user.id}
  onSave={(value) => updateUser({ avatar: value })}
/>`;

export function PickerCard() {
  const [id, setId] = useState('dialog');
  const place = PLACES.find((p) => p.id === id) ?? PLACES[0];
  const { View } = place;

  return (
    <div className="panel pl-card">
      <div className="pl-card-code">
        <div className="pl-card-head">
          <span className="qs-tab">profile.tsx</span>
          <CopyButton className="btn small code" text="npm install glyph-avatar" label="npm install glyph-avatar" icon={copyIcon} />
        </div>
        <Code>{PICKER_CODE}</Code>
        <p className="pl-note">
          Not using React? <code>createAvatar</code> gives you plain SVG, so you can build your own picker on top of it.
        </p>
      </div>
      <div className="pl-places">
        <div className="tab-list" role="tablist" aria-label="Where to put it">
          {PLACES.map((p) => (
            <button key={p.id} type="button" role="tab" aria-selected={p.id === id} onClick={() => setId(p.id)}>{p.label}</button>
          ))}
        </div>
        <div className="pl-place-body">
          <p className="pl-place-note">{place.note}</p>
          <div className="pl-stage"><View key={id} /></div>
          <Code>{place.code}</Code>
        </div>
      </div>
    </div>
  );
}
