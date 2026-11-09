import type { HTMLAttributes } from 'react';
import { createAvatar, type AvatarInput, type AvatarOptions } from '../index';

type SpanProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'dangerouslySetInnerHTML'>;

export interface AvatarProps extends Omit<AvatarOptions, 'size' | 'title'>, SpanProps {
  value: AvatarInput;
  size?: number;
  alt?: string;
}

export function Avatar(props: AvatarProps) {
  const {
    value,
    size = 40,
    alt,
    glyph,
    glyphs,
    colors,
    colorSeed,
    palette,
    background,
    backgrounds,
    shape,
    radius,
    style,
    ...rest
  } = props;
  const svg = createAvatar(value, { glyph, glyphs, colors, colorSeed, palette, background, backgrounds, shape, radius, size, title: alt });

  return (
    <span
      {...rest}
      style={{ display: 'inline-block', width: size, height: size, lineHeight: 0, flexShrink: 0, ...style }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
