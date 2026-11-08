import { useEffect, type ReactNode } from 'react';
import { avatarDataUri } from 'glyph-avatars';
import { Count } from './count';
import { Examples } from './examples';
import { Draws } from './draws';
import { Hero } from './hero';
import { PickerCard } from './picker/picker-card';
import { QuickStart } from './quickstart';
import { CopyButton, INSTALL, REPO, githubIcon } from './ui';

function Lead(props: { title: string; children: ReactNode }) {
  const { title, children } = props;
  return (
    <div className="lead col">
      <h2>{title}</h2>
      <p>{children}</p>
    </div>
  );
}

export function App() {
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = avatarDataUri('glyph-avatars', { size: 64 });
    document.head.append(link);
    return () => link.remove();
  }, []);

  return (
    <main>
      <Hero>
        <p className="version">v0.1.0</p>
        <h1>glyph-avatars</h1>
        <p className="lede">Turn any text into an avatar. The same text always gets the same avatar.</p>
        <div className="cta">
          <CopyButton className="btn primary code" text={INSTALL} label={INSTALL} />
          <a className="btn" href={REPO}>{githubIcon}GitHub</a>
        </div>
        <p className="meta">No dependencies · TypeScript · MIT</p>
      </Hero>

      <section className="section" data-testid="quickstart">
        <Lead title="How to use it.">Pass in any text and get an SVG avatar back.</Lead>
        <QuickStart />
        <div className="sub-block">
          <p className="sub-lead">Need a picker too? There’s a ready-made one for React.</p>
          <PickerCard />
        </div>
      </section>

      <section className="section" data-testid="usage">
        <Lead title="Examples.">Six people, one option at a time. Click one to see the code and what you get.</Lead>
        <Examples />
      </section>

      <section className="section" data-testid="count">
        <Lead title="How many are there?">More than you'll ever need.</Lead>
        <Count />
      </section>

      <section className="section" data-testid="numbers">
        <Lead title="What it draws.">Every shape comes out a little different each time.</Lead>
        <Draws />
      </section>

      <footer>
        <nav>
          <a href={REPO}>GitHub</a>
          <a href="https://www.npmjs.com/package/glyph-avatars">npm</a>
          <span>MIT</span>
        </nav>
      </footer>
    </main>
  );
}
