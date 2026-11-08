import { useState } from 'react';
import type { ColorMode } from 'glyph-avatar';
import { Avatar, AvatarPicker } from '@glyph-avatar/react';

const TEAM = ['Maya Chen', 'Omar Haddad', 'Lena Fischer', 'Kofi Mensah', 'Priya Raman', 'Jonas Berg'];

export function App() {
  const [colors, setColors] = useState<ColorMode>('generated');
  const [saved, setSaved] = useState<string | null>(null);

  return (
    <main>
      <header>
        <h1>Glyph Avatar playground</h1>
        <p>Runs <code>@glyph-avatar/react</code> against the core source.</p>
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
