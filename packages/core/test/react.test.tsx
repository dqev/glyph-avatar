// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { createAvatar } from '../src';
import {
  Avatar,
  AvatarPicker,
  AvatarPickerHoneycomb,
  AvatarPickerNewColors,
  AvatarPickerPreview,
  AvatarPickerReset,
  AvatarPickerRoot,
  useAvatarPicker,
} from '../src/react';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  window.matchMedia = (query: string) => ({ matches: true, media: query, addEventListener() {}, removeEventListener() {} }) as unknown as MediaQueryList;
});

let root: Root | null = null;
let host: HTMLElement | null = null;

function render(ui: React.ReactNode) {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  act(() => root!.render(ui));
  return host;
}

afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  root = null;
  host = null;
});

const html = (svg: string) => {
  const box = document.createElement('div');
  box.innerHTML = svg;
  return box.innerHTML;
};
const part = (el: HTMLElement, name: string) => el.querySelector<HTMLElement>(`[data-part='${name}']`)!;
const click = (el: HTMLElement) => act(() => el.click());

describe('Avatar', () => {
  it('draws the same SVG as createAvatar and passes other props to the span', () => {
    const onClick = vi.fn();
    const el = render(<Avatar value="maya" size={32} shape="square" data-testid="me" aria-label="Maya" onClick={onClick} />);
    const span = el.querySelector('span')!;
    expect(span.innerHTML).toBe(html(createAvatar('maya', { size: 32, shape: 'square' })));
    expect(span.dataset.testid).toBe('me');
    expect(span.getAttribute('aria-label')).toBe('Maya');
    click(span);
    expect(onClick).toHaveBeenCalledOnce();
  });
});

describe('AvatarPicker parts', () => {
  it('starts on the avatar the user already has, in the same colors', () => {
    const el = render(
      <AvatarPickerRoot defaultValue="maya" colors="curated">
        <AvatarPickerPreview size={40} />
      </AvatarPickerRoot>,
    );
    expect(part(el, 'preview').innerHTML).toBe(html(createAvatar('maya', { size: 40, colors: 'curated' })));
  });

  it('only calls onChange when the choice changes', () => {
    const onChange = vi.fn();
    const el = render(
      <AvatarPickerRoot defaultValue="maya" onChange={onChange}>
        <AvatarPickerHoneycomb />
        <AvatarPickerNewColors />
      </AvatarPickerRoot>,
    );
    expect(onChange).not.toHaveBeenCalled();
    click(part(el, 'new-colors'));
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange.mock.calls[0][0]).toMatch(/^v1:maya:/);
  });

  it('keeps Reset in place and enables it after a change', () => {
    const el = render(
      <AvatarPickerRoot defaultValue="maya">
        <AvatarPickerPreview />
        <AvatarPickerNewColors>Colors</AvatarPickerNewColors>
        <AvatarPickerReset />
      </AvatarPickerRoot>,
    );
    const before = part(el, 'preview').innerHTML;
    expect(part(el, 'reset')).toHaveProperty('disabled', true);
    click(part(el, 'new-colors'));
    expect(part(el, 'preview').innerHTML).not.toBe(before);
    expect(part(el, 'reset')).toHaveProperty('disabled', false);
    click(part(el, 'reset'));
    expect(part(el, 'preview').innerHTML).toBe(before);
  });

  it('lets a click handler stop the built-in action', () => {
    const el = render(
      <AvatarPickerRoot defaultValue="maya">
        <AvatarPickerPreview />
        <AvatarPickerNewColors onClick={(e) => e.preventDefault()} />
      </AvatarPickerRoot>,
    );
    const before = part(el, 'preview').innerHTML;
    click(part(el, 'new-colors'));
    expect(part(el, 'preview').innerHTML).toBe(before);
  });

  it('gives your own buttons the value through useAvatarPicker', () => {
    const onSave = vi.fn();
    function Save() {
      const { value } = useAvatarPicker();
      return <button data-part="mine" onClick={() => onSave(value)}>Save</button>;
    }
    const el = render(
      <AvatarPickerRoot defaultValue="maya" unstyled>
        <Save />
      </AvatarPickerRoot>,
    );
    expect(part(el, 'root').className).toBe('');
    click(part(el, 'mine'));
    expect(onSave).toHaveBeenCalledWith('v1:maya');
  });

  it('explains when a part is used outside the root', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<AvatarPickerReset />)).toThrow(/inside <AvatarPickerRoot>/);
  });
});

describe('AvatarPicker', () => {
  it('saves the picked value and only shows Cancel when asked', () => {
    const onSave = vi.fn();
    const el = render(<AvatarPicker defaultValue="maya" onSave={onSave} />);
    expect(part(el, 'cancel')).toBeNull();
    click(part(el, 'save'));
    expect(onSave).toHaveBeenCalledWith('v1:maya');
  });
});
