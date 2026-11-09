import { useState } from 'react';
import type { ColorMode } from 'glyph-avatar';
import {
  Avatar,
  AvatarPicker,
  AvatarPickerHoneycomb,
  AvatarPickerNewBackground,
  AvatarPickerNewColors,
  AvatarPickerNewShape,
  AvatarPickerPreview,
  AvatarPickerReset,
  AvatarPickerRoot,
  AvatarPickerShuffle,
  useAvatarPicker,
} from 'glyph-avatar/react';

function UseButton(props: { onUse: (value: string) => void }) {
  const { onUse } = props;
  const { value } = useAvatarPicker();
  return <button type="button" className="use" onClick={() => onUse(value)}>Use this one</button>;
}

function ComposedPicker(props: { onUse: (value: string) => void }) {
  const { onUse } = props;
  return (
    <AvatarPickerRoot unstyled className="composed" data-testid="composed">
      <div className="composed-side">
        <AvatarPickerPreview size={88} />
        <AvatarPickerShuffle>Shuffle all</AvatarPickerShuffle>
        <AvatarPickerNewShape>Shape</AvatarPickerNewShape>
        <AvatarPickerNewColors>Colors</AvatarPickerNewColors>
        <AvatarPickerNewBackground>Background</AvatarPickerNewBackground>
        <AvatarPickerReset />
        <UseButton onUse={onUse} />
      </div>
      <AvatarPickerHoneycomb className="composed-hive" />
    </AvatarPickerRoot>
  );
}

const TEAM = ['Maya Chen', 'Omar Haddad', 'Lena Fischer', 'Kofi Mensah', 'Priya Raman', 'Jonas Berg'];

export function App() {
  const [colors, setColors] = useState<ColorMode>('generated');
  const [saved, setSaved] = useState<string | null>(null);

  return (
    <main>
      <header>
        <h1>Glyph Avatar playground</h1>
        <p>Runs <code>glyph-avatar/react</code> against the source.</p>
        <label>
          Colors{' '}
          <select value={colors} onChange={(e) => setColors(e.target.value as ColorMode)}>
            <option value="generated">Generated</option>
            <option value="curated">Curated</option>
          </select>
        </label>
      </header>

      <AvatarPicker colors={colors} defaultValue={saved ?? undefined} onSave={setSaved} />

      <section>
        <h2>Composed from parts</h2>
        <ComposedPicker onUse={setSaved} />
      </section>

      <section>
        <h2>Saved value</h2>
        {!saved && <p>Nothing saved yet. Press Save in the picker.</p>}
        {saved && (
          <div className="saved">
            <code>{saved}</code>
            <div className="sizes">
              {[64, 40, 28, 20].map((size) => (
                <Avatar key={size} value={saved} size={size} alt="Your avatar" />
              ))}
              <Avatar value={saved} size={40} shape="square" />
            </div>
          </div>
        )}
      </section>

      <section>
        <h2>Seeded by name</h2>
        <ul className="team">
          {TEAM.map((name) => (
            <li key={name}>
              <Avatar value={name} size={32} colors={colors} />
              {name}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
