import { useState, type ReactNode } from 'react';
import { avatarDataUri, type AvatarOptions } from 'glyph-avatar';
import { Avatar } from 'glyph-avatar/react';
import { Code } from './code';

const TEAM = ['maya@studio.dev', 'omar@studio.dev', 'lena@studio.dev', 'kofi@studio.dev', 'priya@studio.dev', 'jonas@studio.dev'];

const BRAND = { name: 'brand', bg: '#ff8c26', fg: '#1c0f04' };

function Team(props: { options?: AvatarOptions }) {
  const { options } = props;
  return (
    <div className="team">
      {TEAM.map((email) => (
        <Avatar key={email} value={email} size={36} alt={email} {...options} />
      ))}
    </div>
  );
}

function Images() {
  return (
    <div className="team">
      {TEAM.map((email) => (
        <img key={email} src={avatarDataUri(email, { size: 36 })} width={36} height={36} alt="" />
      ))}
    </div>
  );
}

interface Example {
  title: string;
  note: string;
  code: string;
  output: ReactNode;
}

const EXAMPLES: Example[] = [
  {
    title: 'From any text',
    note: 'A name, an email, an ID. Anything works.',
    code: "import { createAvatar } from 'glyph-avatar'\n\nel.innerHTML = createAvatar(user.id)",
    output: <Team />,
  },
  {
    title: 'In React',
    note: 'Show everyone in a list.',
    code: "import { Avatar } from 'glyph-avatar/react'\n\n{users.map((user) => (\n  <Avatar key={user.id} value={user.id} size={36} />\n))}",
    output: (
      <div className="stack">
        {TEAM.map((email) => (
          <Avatar key={email} value={email} size={36} />
        ))}
        <span className="stack-more">+12</span>
      </div>
    ),
  },
  {
    title: 'Any size',
    note: 'Stays sharp at any size.',
    code: 'createAvatar(user.id, { size: 64 })',
    output: (
      <div className="team sizes">
        {[64, 40, 28, 20, 16].map((size) => (
          <Avatar key={size} value={TEAM[0]} size={size} />
        ))}
      </div>
    ),
  },
  {
    title: 'Rounded squares',
    note: 'Same avatars, square corners.',
    code: "createAvatar(user.id, { shape: 'square', radius: 16 })",
    output: <Team options={{ shape: 'square', radius: 16 }} />,
  },
  {
    title: 'One background',
    note: 'Give everyone the same background.',
    code: "createAvatar(user.id, { background: 'solid' })",
    output: <Team options={{ background: 'solid' }} />,
  },
  {
    title: 'Curated colors',
    note: 'A smaller set of hand-picked colors.',
    code: "createAvatar(user.id, { colors: 'curated' })",
    output: <Team options={{ colors: 'curated' }} />,
  },
  {
    title: 'Your brand colors',
    note: 'Use your own two colors.',
    code: "createAvatar(user.id, {\n  palette: { name: 'brand', bg: '#ff8c26', fg: '#1c0f04' },\n})",
    output: <Team options={{ palette: BRAND }} />,
  },
  {
    title: 'One family',
    note: 'One shape for everyone, like a team or a bot.',
    code: "createAvatar(user.id, { glyph: 'flower' })",
    output: <Team options={{ glyph: 'flower' }} />,
  },
  {
    title: 'Recolor everyone',
    note: "Change everyone's colors, keep their shapes.",
    code: "createAvatar(user.id, { colorSeed: 'spring' })",
    output: <Team options={{ colorSeed: 'spring' }} />,
  },
  {
    title: 'From your server',
    note: 'Serve avatars as image links.',
    code: "app.get('/avatars/:id.svg', (req, res) => {\n  res.type('svg').send(createAvatar(req.params.id))\n})",
    output: <Images />,
  },
  {
    title: 'As an image',
    note: 'Put it straight into an img tag.',
    code: '<img src={avatarDataUri(user.id)} alt="" />',
    output: <Images />,
  },
];

export function Examples() {
  const [active, setActive] = useState(EXAMPLES[0].title);
  const example = EXAMPLES.find((item) => item.title === active) ?? EXAMPLES[0];

  return (
    <div className="panel tabs">
      <div className="tab-list" role="tablist" aria-label="Examples">
        {EXAMPLES.map((item) => (
          <button key={item.title} type="button" role="tab" aria-selected={item.title === active} onClick={() => setActive(item.title)}>
            {item.title}
          </button>
        ))}
      </div>
      <div className="tab-body" role="tabpanel">
        <div className="tab-stage">{example.output}</div>
        <div className="tab-text">
          <h3>{example.title}</h3>
          <p>{example.note}</p>
        </div>
        <Code>{example.code}</Code>
      </div>
    </div>
  );
}
