import type { CSSProperties } from 'react';
import { createAvatar, type AvatarInput, type AvatarOptions } from '../index';

export interface AvatarProps extends Omit<AvatarOptions, 'size' | 'title'> {
  value: AvatarInput;
  size?: number;
  alt?: string;
  className?: string;
  style?: CSSProperties;
}

export function Avatar(props: AvatarProps) {
  const { value, size = 40, alt, className, style, ...options } = props;
  const svg = createAvatar(value, { ...options, size, title: alt });

  return (
    <span
      className={className}
      style={{ display: 'inline-block', width: size, height: size, lineHeight: 0, flexShrink: 0, ...style }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
