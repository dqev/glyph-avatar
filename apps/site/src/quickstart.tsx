import { useState } from 'react';
import { createAvatar } from 'glyph-avatars';
import { Avatar } from 'glyph-avatars/react';

const SEED = 'maya@studio.dev';
const preview = (svg: string) => `${svg.slice(0, 74)}…`;

export function QuickStart() {
  const [value, setValue] = useState(SEED);
  const seed = value.trim() || SEED;

  return (
    <div className="panel qs-split">
      <div className="qs-pane">
        <span className="qs-tab">app.ts</span>
        <pre className="qs-code">
          <code>
            <span className="k">import</span> {'{ createAvatar } '}<span className="k">from</span> <span className="s">'glyph-avatars'</span>
            {'\n\nconst svg = createAvatar('}
            <span className="s">'</span>
            <input
              className="qs-input"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              style={{ width: `${Math.max(value.length, 1)}ch` }}
              spellCheck={false}
              aria-label="Text to turn into an avatar"
            />
            <span className="s">'</span>
            {')'}
          </code>
        </pre>
        <p className="qs-hint">Edit the text in orange.</p>
      </div>
      <div className="qs-pane out">
        <span className="qs-tab">Output</span>
        <div className="qs-out">
          <Avatar key={seed} value={seed} size={120} />
          <code>{preview(createAvatar(seed))}</code>
        </div>
      </div>
    </div>
  );
}
