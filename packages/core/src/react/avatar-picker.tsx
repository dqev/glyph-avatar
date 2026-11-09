import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { BACKGROUNDS, buildAvatar, parseSpec, stringifySpec, type AvatarSpec, type ColorMode } from '../index';
import { Avatar, type AvatarProps } from './avatar';
import { createHoneycomb, type Honeycomb } from './honeycomb';
import { usePickerStyles } from './styles';

const randomSeed = () => Math.random().toString(36).slice(2, 9);

function hueOf(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return (Math.atan2(Math.sqrt(3) * (g - b), 2 * r - g - b) * 180) / Math.PI;
}

function farApart(a: string, b: string) {
  const d = Math.abs(hueOf(a) - hueOf(b)) % 360;
  return Math.min(d, 360 - d) >= 70;
}

function pickSeed(accept: (seed: string) => boolean) {
  let seed = randomSeed();
  for (let i = 0; i < 24 && !accept(seed); i++) {
    seed = randomSeed();
  }
  return seed;
}

const shuffleIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" /></svg>
);
const shapeIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true"><path d="M8 1.8 13.4 4.9v6.2L8 14.2 2.6 11.1V4.9Z" /></svg>
);
const colorsIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="8" cy="8" r="6" /><path d="M8 2a6 6 0 0 0 0 12Z" fill="currentColor" /></svg>
);
const backgroundIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="8" cy="8" r="6" /><circle cx="8" cy="8" r="2.5" fill="currentColor" /></svg>
);

export interface AvatarPickerState {
  value: string;
  changed: boolean;
  shuffle: () => void;
  newShape: () => void;
  newColors: () => void;
  newBackground: () => void;
  reset: () => void;
}

interface PickerContext extends AvatarPickerState {
  connect: (el: HTMLElement) => () => void;
}

const Context = createContext<PickerContext | null>(null);

function usePickerContext(): PickerContext {
  const context = useContext(Context);
  if (!context) {
    throw new Error('useAvatarPicker and the AvatarPicker parts must be used inside <AvatarPickerRoot>.');
  }
  return context;
}

export function useAvatarPicker(): AvatarPickerState {
  return usePickerContext();
}

export interface AvatarPickerRootProps extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  defaultValue?: string;
  colors?: ColorMode;
  onChange?: (value: string) => void;
  unstyled?: boolean;
}

export function AvatarPickerRoot(props: AvatarPickerRootProps) {
  const { defaultValue, colors = 'generated', onChange, unstyled = false, className, style, children, ...rest } = props;

  usePickerStyles();

  const engineRef = useRef<Honeycomb | null>(null);
  const saltRef = useRef(randomSeed());
  const initialRef = useRef<AvatarSpec | null>(defaultValue ? parseSpec(defaultValue) ?? { seed: defaultValue, colors } : null);
  const reported = useRef<string | null>(null);

  const specAt = (q: number, r: number): AvatarSpec => {
    if (q === 0 && r === 0 && initialRef.current) {
      return initialRef.current;
    }
    return { seed: `${saltRef.current}-${q}.${r}`, colors };
  };

  const [origin, setOrigin] = useState<AvatarSpec>(() => specAt(0, 0));
  const [spec, setSpec] = useState<AvatarSpec>(origin);

  const connect = useCallback(
    (el: HTMLElement) => {
      const engine = createHoneycomb(el, {
        render: (q, r) => buildAvatar(specAt(q, r)).svg,
        onFocus: (q, r) => {
          const next = specAt(q, r);
          setOrigin(next);
          setSpec(next);
        },
      });
      engineRef.current = engine;
      engine.reset();
      return () => {
        engine.destroy();
        engineRef.current = null;
      };
    },
    [colors],
  );

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) {
      return;
    }
    if (spec === origin) {
      engine.restoreFocus();
      return;
    }
    engine.paintFocus(buildAvatar(spec).svg);
  }, [spec, origin]);

  const value = stringifySpec(spec);

  useEffect(() => {
    if (reported.current === null) {
      reported.current = value;
      return;
    }
    if (reported.current === value) {
      return;
    }
    reported.current = value;
    onChange?.(value);
  }, [value]);

  const current = buildAvatar(spec);

  const context: PickerContext = {
    value,
    changed: spec !== origin,
    connect,
    shuffle: () => {
      saltRef.current = randomSeed();
      initialRef.current = null;
      engineRef.current?.reset();
    },
    newShape: () => {
      const base = { ...spec, colorSeed: spec.colorSeed ?? spec.seed, background: current.background };
      const seed = pickSeed((next) => buildAvatar({ ...base, seed: next }).glyph !== current.glyph);
      setSpec({ ...base, seed });
    },
    newColors: () => {
      const colorSeed = pickSeed((next) => farApart(buildAvatar({ ...spec, colorSeed: next }).palette.bg, current.palette.bg));
      setSpec({ ...spec, colorSeed });
    },
    newBackground: () => {
      const others = BACKGROUNDS.filter((b) => b !== current.background);
      setSpec({ ...spec, background: others[Math.floor(Math.random() * others.length)] });
    },
    reset: () => setSpec(origin),
  };

  const classes = [unstyled ? '' : 'ga-picker', className].filter(Boolean).join(' ');
  const tint = { '--ga-tint': current.palette.bg, ...style } as CSSProperties;

  return (
    <Context.Provider value={context}>
      <div {...rest} className={classes || undefined} style={tint} data-part="root">
        {children}
      </div>
    </Context.Provider>
  );
}

export type AvatarPickerHoneycombProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'>;

export function AvatarPickerHoneycomb(props: AvatarPickerHoneycombProps) {
  const { className, ...rest } = props;
  const { connect } = usePickerContext();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    return connect(el);
  }, [connect]);

  return (
    <div
      tabIndex={0}
      role="group"
      aria-label="Avatars. Drag, swipe, or use the arrow keys to move between them."
      {...rest}
      ref={ref}
      className={className ? `ga-hive ${className}` : 'ga-hive'}
      data-part="honeycomb"
    />
  );
}

export type AvatarPickerButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

function actionButton(name: string, part: string, label: string, icon: ReactNode, pick: (state: AvatarPickerState) => () => void, ghost = false) {
  function PickerButton(props: AvatarPickerButtonProps) {
    const { className, children, onClick, ...rest } = props;
    const state = useAvatarPicker();
    const run = pick(state);

    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      if (e.defaultPrevented) {
        return;
      }
      run();
    };

    const base = ghost ? 'ga-ghost' : 'ga-icon';
    return (
      <button
        type="button"
        title={ghost ? undefined : label}
        aria-label={children ? undefined : label}
        {...rest}
        className={className ? `${base} ${className}` : base}
        data-part={part}
        onClick={handleClick}
      >
        {children ?? icon}
      </button>
    );
  }
  PickerButton.displayName = name;
  return PickerButton;
}

export const AvatarPickerShuffle = actionButton('AvatarPickerShuffle', 'shuffle', 'Shuffle', <>{shuffleIcon}<span className="ga-label">Shuffle</span></>, (s) => s.shuffle, true);
export const AvatarPickerNewShape = actionButton('AvatarPickerNewShape', 'new-shape', 'New shape', shapeIcon, (s) => s.newShape);
export const AvatarPickerNewColors = actionButton('AvatarPickerNewColors', 'new-colors', 'New colors', colorsIcon, (s) => s.newColors);
export const AvatarPickerNewBackground = actionButton('AvatarPickerNewBackground', 'new-background', 'New background', backgroundIcon, (s) => s.newBackground);

export function AvatarPickerReset(props: AvatarPickerButtonProps) {
  const { className, children, onClick, ...rest } = props;
  const { changed, reset } = useAvatarPicker();

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) {
      return;
    }
    reset();
  };

  return (
    <button
      type="button"
      disabled={!changed}
      {...rest}
      className={className ? `ga-btn ga-reset ${className}` : 'ga-btn ga-reset'}
      data-part="reset"
      onClick={handleClick}
    >
      {children ?? 'Reset'}
    </button>
  );
}

export type AvatarPickerPreviewProps = Omit<AvatarProps, 'value'>;

export function AvatarPickerPreview(props: AvatarPickerPreviewProps) {
  const { value } = useAvatarPicker();
  return <Avatar {...props} value={value} data-part="preview" />;
}

export interface AvatarPickerProps {
  defaultValue?: string;
  colors?: ColorMode;
  title?: string;
  description?: string;
  saveLabel?: string;
  onChange?: (value: string) => void;
  onSave?: (value: string) => void;
  onCancel?: () => void;
  className?: string;
}

function SaveButton(props: { label: string; onSave?: (value: string) => void }) {
  const { label, onSave } = props;
  const { value } = useAvatarPicker();
  return (
    <button type="button" className="ga-btn ga-primary" data-part="save" onClick={() => onSave?.(value)}>{label}</button>
  );
}

export function AvatarPicker(props: AvatarPickerProps) {
  const {
    defaultValue,
    colors,
    title = 'Choose an avatar',
    description = 'Drag to look around, then pick one you like.',
    saveLabel = 'Save',
    onChange,
    onSave,
    onCancel,
    className,
  } = props;

  return (
    <AvatarPickerRoot defaultValue={defaultValue} colors={colors} onChange={onChange} className={className}>
      {(title || description) && (
        <div className="ga-head" data-part="header">
          {title && <h3 data-part="title">{title}</h3>}
          {description && <p data-part="description">{description}</p>}
        </div>
      )}
      <AvatarPickerHoneycomb />
      <div className="ga-foot" data-part="footer">
        <AvatarPickerShuffle />
        <span className="ga-sep" />
        <AvatarPickerNewShape />
        <AvatarPickerNewColors />
        <AvatarPickerNewBackground />
        <AvatarPickerReset />
        <span className="ga-grow" />
        {onCancel && (
          <button type="button" className="ga-btn" data-part="cancel" onClick={onCancel}>Cancel</button>
        )}
        <SaveButton label={saveLabel} onSave={onSave} />
      </div>
    </AvatarPickerRoot>
  );
}
