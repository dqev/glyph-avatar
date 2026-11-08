import type { ReactNode } from 'react';

const TOKENS = /(\/\/[^\n]*)|('[^'\n]*'|"[^"\n]*")|\b(import|from|const|export|return)\b|(<\/?[A-Z][A-Za-z]*|\b\d+\b)/g;

export function Code(props: { children: string }) {
  const { children } = props;
  const parts: ReactNode[] = [];
  let last = 0;
  for (const match of children.matchAll(TOKENS)) {
    const index = match.index ?? 0;
    if (index > last) {
      parts.push(children.slice(last, index));
    }
    const [text, comment, string, keyword] = match;
    let className = 'n';
    if (comment) {
      className = 'c';
    }
    if (string) {
      className = 's';
    }
    if (keyword) {
      className = 'k';
    }
    parts.push(<span key={index} className={className}>{text}</span>);
    last = index + text.length;
  }
  parts.push(children.slice(last));
  return <pre><code>{parts}</code></pre>;
}
