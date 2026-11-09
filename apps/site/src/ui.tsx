import { useEffect, useState, type ReactNode } from 'react';

export const INSTALL = 'npm install glyph-avatar';
export const REPO = 'https://github.com/nilbuild/glyph-avatar';
export const DOCS = REPO;

export function DocsLink(props: { anchor: string; children: ReactNode }) {
  const { anchor, children } = props;
  return (
    <a className="docs-link" href={`${REPO}#${anchor}`} target="_blank" rel="noreferrer">
      {children}<span aria-hidden="true">→</span>
    </a>
  );
}

export const copyIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    <rect x="5.5" y="5.5" width="8" height="8" rx="2" />
    <path d="M10.5 3.5v-.25A1.75 1.75 0 0 0 8.75 1.5h-5.5A1.75 1.75 0 0 0 1.5 3.25v5.5c0 .97.78 1.75 1.75 1.75h.25" />
  </svg>
);

export const githubIcon = (
  <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
  </svg>
);

export function CopyButton(props: { text: string; label: string; className?: string; icon?: ReactNode }) {
  const { text, label, className, icon } = props;
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');

  useEffect(() => {
    if (state === 'idle') {
      return;
    }
    const timer = window.setTimeout(() => setState('idle'), 1400);
    return () => window.clearTimeout(timer);
  }, [state]);

  const copy = () => {
    navigator.clipboard.writeText(text).then(() => setState('copied'), () => setState('failed'));
  };

  return (
    <button type="button" className={className} onClick={copy}>
      {icon}
      {state === 'idle' && label}
      {state === 'copied' && 'Copied'}
      {state === 'failed' && 'Copy failed'}
    </button>
  );
}
