import { useInsertionEffect } from 'react';

const ID = 'glyph-avatar-picker';

const CSS = `
.ga-hive {
  position: relative; overflow: hidden; touch-action: none; cursor: grab; outline: none;
  user-select: none; -webkit-user-select: none;
}
.ga-hive.is-dragging { cursor: grabbing; }
.ga-hive:not(.is-dragging) .ga-cell { cursor: pointer; }
.ga-cell { position: absolute; left: 0; top: 0; border-radius: 50%; line-height: 0; will-change: translate, transform, opacity; }
.ga-cell svg { width: 100%; height: 100%; display: block; pointer-events: none; transition: transform 0.18s cubic-bezier(0.3, 1.4, 0.5, 1); }
.ga-cell.is-focus::after {
  content: ''; position: absolute; inset: calc(-3px - var(--ga-ring-width, 2.5px)); border-radius: 50%;
  border: var(--ga-ring-width, 2.5px) solid var(--ga-ring, var(--ga-ink, currentColor)); pointer-events: none;
  animation: ga-ring 0.24s ease-out; transition: opacity 0.24s ease-out, scale 0.24s ease-out;
}
.ga-hive.is-free .ga-cell.is-focus::after { opacity: 0; scale: 1.1; transition-duration: 0.1s; }
.ga-hive:not(.is-free):not(.is-moving) .ga-cell:not(.is-focus):hover svg { transform: scale(1.07); }
.ga-hive.is-shuffling .ga-cell { animation: ga-pop 0.45s cubic-bezier(0.3, 1.4, 0.5, 1) both; animation-delay: var(--ga-delay, 0ms); }

.ga-picker {
  --ga-panel: #1e1d25;
  --ga-ink: #f2f0f7;
  --ga-muted: #9c99ab;
  --ga-tint: var(--ga-panel);
  --ga-bg: color-mix(in oklab, var(--ga-panel) 88%, var(--ga-tint));
  --ga-soft: color-mix(in oklab, var(--ga-ink) 12%, transparent);
  background: var(--ga-bg);
  color: var(--ga-ink);
  border-radius: var(--ga-radius, 20px);
  padding: var(--ga-padding, 20px 20px 14px);
  display: grid;
  gap: var(--ga-gap, 12px);
  min-width: 0;
  font-size: 14px;
  line-height: 1.5;
  transition: background-color 0.5s ease;
  container-type: inline-size;
}
.ga-picker * { box-sizing: border-box; }
.ga-picker button { font: inherit; cursor: pointer; }
.ga-picker h3 { margin: 0; font-size: var(--ga-title-size, 17px); font-weight: 600; letter-spacing: -0.01em; }
.ga-picker p { margin: 0; }
.ga-picker .ga-head p { color: var(--ga-muted); margin-top: 2px; }
.ga-picker .ga-hive { margin-inline: -8px; }

.ga-picker .ga-foot { display: flex; align-items: center; gap: 4px; border-top: 1px solid var(--ga-soft); padding-top: 12px; }
.ga-picker .ga-grow { flex: 1; }
.ga-picker .ga-sep { width: 1px; height: 18px; margin: 0 6px; background: var(--ga-soft); }
.ga-picker .ga-ghost { display: inline-flex; align-items: center; gap: 8px; height: 32px; padding: 0 8px; border: 0; border-radius: var(--ga-button-radius, 8px); background: none; color: var(--ga-ink); font-weight: 600; }
.ga-picker .ga-icon { display: grid; place-items: center; width: 32px; height: 32px; border: 0; border-radius: var(--ga-button-radius, 8px); background: none; color: var(--ga-muted); transition: color 0.15s, background-color 0.15s, transform 0.1s; }
.ga-picker .ga-ghost:hover, .ga-picker .ga-icon:hover { background: var(--ga-soft); color: var(--ga-ink); }
.ga-picker .ga-icon:active, .ga-picker .ga-ghost:active { transform: scale(0.94); }
.ga-picker .ga-btn { height: 34px; padding: 0 14px; border: 1px solid color-mix(in oklab, var(--ga-ink) 16%, transparent); border-radius: var(--ga-button-radius, 10px); background: none; color: var(--ga-ink); font-weight: 600; }
.ga-picker .ga-btn.ga-reset { border: 0; padding: 0 8px; color: var(--ga-muted); font-weight: 500; }
.ga-picker .ga-btn.ga-reset:hover { color: var(--ga-ink); }
.ga-picker .ga-foot [data-part='reset']:disabled { display: none; }
.ga-picker .ga-primary { border: 0; background: var(--ga-accent, var(--ga-ink)); color: var(--ga-accent-ink, var(--ga-panel)); margin-left: 4px; }
.ga-picker button:focus-visible { outline: none; box-shadow: 0 0 0 2px var(--ga-muted); }

@container (max-width: 420px) {
  .ga-picker .ga-ghost { width: 32px; padding: 0; justify-content: center; }
  .ga-picker .ga-ghost .ga-label { display: none; }
  .ga-picker .ga-sep { margin: 0 2px; }
}

@keyframes ga-pop { from { opacity: 0; scale: 0.3; } }
@keyframes ga-ring { from { opacity: 0; scale: 1.14; } }

@media (prefers-reduced-motion: reduce) {
  .ga-picker { transition: none; }
  .ga-cell, .ga-cell svg, .ga-cell::after { animation: none !important; transition: none !important; }
}
`;

export function usePickerStyles() {
  useInsertionEffect(() => {
    if (document.getElementById(ID)) {
      return;
    }
    const style = document.createElement('style');
    style.id = ID;
    style.textContent = CSS;
    document.head.prepend(style);
  }, []);
}
