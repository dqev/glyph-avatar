import { useState } from 'react';
import { GLYPH_NAMES } from 'glyph-avatars';
import { Avatar } from '@glyph-avatars/react';

export function Draws() {
  const [rounds, setRounds] = useState<Record<string, number>>({});

  return (
    <div className="dq-quiet">
      <div className="dq-grid">
        {GLYPH_NAMES.map((name) => {
          const round = rounds[name] ?? 0;
          return (
            <button key={name} type="button" aria-label={`Draw another ${name}`} onClick={() => setRounds((r) => ({ ...r, [name]: round + 1 }))}>
              <Avatar key={round} value={`${name}:${round}`} glyph={name} size={56} />
            </button>
          );
        })}
      </div>
      <p className="dq-caption">One of each of the 32 shapes. Click any of them to draw another.</p>
    </div>
  );
}
