import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { createPortal } from 'react-dom';
import { Avatar, AvatarPicker } from '@glyph-avatars/react';

export type Step = 'idle' | 'menu' | 'dialog' | 'saved';
type Photo = { kind: 'letter' } | { kind: 'photo'; url: string } | { kind: 'avatar'; value: string };

export interface Profile {
  step: Step;
  photo: Photo;
  toggleMenu: () => void;
  closeMenu: () => void;
  choose: () => void;
  upload: (url: string) => void;
  cancel: () => void;
  save: (value: string) => void;
}

export function useProfile(): Profile {
  const [step, setStep] = useState<Step>('idle');
  const [photo, setPhoto] = useState<Photo>({ kind: 'letter' });

  return {
    step,
    photo,
    toggleMenu: () => setStep((s) => (s === 'menu' ? 'idle' : 'menu')),
    closeMenu: () => setStep((s) => (s === 'menu' ? 'idle' : s)),
    choose: () => setStep('dialog'),
    upload: (url) => {
      setPhoto({ kind: 'photo', url });
      setStep('saved');
    },
    cancel: () => setStep('idle'),
    save: (value) => {
      setPhoto({ kind: 'avatar', value });
      setStep('saved');
    },
  };
}

const pencil = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" aria-hidden="true">
    <path d="M10.5 2.5 13.5 5.5 5.5 13.5H2.5V10.5Z" /><path d="M9 4l3 3" />
  </svg>
);

const imageIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    <rect x="2" y="2" width="12" height="12" rx="2.5" /><circle cx="6" cy="6.5" r="1.3" /><path d="m2.5 12 3.5-3.5 2.5 2.5 2-2 3 3" />
  </svg>
);

const shapesIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    <circle cx="6" cy="6" r="4" /><rect x="7.5" y="7.5" width="6.5" height="6.5" rx="1.5" />
  </svg>
);

function PhotoArt(props: { photo: Photo; size: number }) {
  const { photo, size } = props;
  if (photo.kind === 'photo') {
    return <img src={photo.url} alt="" width={size} height={size} />;
  }
  if (photo.kind === 'avatar') {
    return <Avatar value={photo.value} size={size} />;
  }
  return <span className="pd-letter">M</span>;
}

export function ProfileWindow(props: { profile: Profile; hint?: boolean }) {
  const { profile, hint = false } = props;
  const { step, photo } = profile;
  const anchor = useRef<HTMLDivElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    if (step !== 'menu') {
      return;
    }
    const close = (event: PointerEvent) => {
      if (anchor.current?.contains(event.target as Node)) {
        return;
      }
      profile.closeMenu();
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [step]);

  useEffect(() => {
    if (step !== 'saved') {
      return;
    }
    setToast(true);
    const timer = window.setTimeout(() => setToast(false), 2200);
    return () => window.clearTimeout(timer);
  }, [step, photo]);

  const onFile = (event: ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files?.[0];
    event.target.value = '';
    if (!picked) {
      return;
    }
    profile.upload(URL.createObjectURL(picked));
  };

  return (
    <div className="pd-window">
      <div className="pd-bar">
        <span>Settings</span>
        <span className="pd-sep">/</span>
        <b>Profile</b>
      </div>
      <div className="pd-body">
        <div className="pd-row">
          <div className="pd-label">
            <b>Profile photo</b>
            <p>Upload a photo or pick an avatar.</p>
          </div>
          <div className="pd-anchor" ref={anchor}>
            <button type="button" className="pd-photo" aria-label="Change profile photo" aria-expanded={step === 'menu'} onClick={profile.toggleMenu}>
              <PhotoArt key={photo.kind === 'avatar' ? photo.value : photo.kind} photo={photo} size={56} />
              <span className="pd-edit">{pencil}</span>
            </button>
            {hint && step === 'idle' && <span className="pd-ping" aria-hidden="true" />}
            {step === 'menu' && (
              <div className="pd-menu" role="menu">
                <button type="button" role="menuitem" onClick={() => file.current?.click()}>{imageIcon}Upload photo</button>
                <button type="button" role="menuitem" onClick={profile.choose}>{shapesIcon}Choose an avatar</button>
              </div>
            )}
            <input ref={file} type="file" accept="image/*" hidden onChange={onFile} />
          </div>
        </div>
        <div className="pd-row">
          <div className="pd-label"><b>Full name</b></div>
          <span className="pd-field">Maya Chen</span>
        </div>
        <div className="pd-row">
          <div className="pd-label"><b>Email</b></div>
          <span className="pd-field">maya@studio.dev</span>
        </div>
      </div>
      <div className={toast ? 'pd-toast on' : 'pd-toast'} role="status">Profile photo updated</div>
      {step === 'dialog' && <ChooseDialog profile={profile} />}
    </div>
  );
}

function ChooseDialog(props: { profile: Profile }) {
  const { profile } = props;
  const { photo } = profile;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        profile.cancel();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return createPortal(
    <div className="pd-backdrop" onPointerDown={(event) => event.target === event.currentTarget && profile.cancel()}>
      <div className="pd-dialog" role="dialog" aria-modal="true" aria-label="Choose an avatar">
        <AvatarPicker
          className="stage"
          description="Use one of these instead of a photo."
          defaultValue={photo.kind === 'avatar' ? photo.value : 'maya@studio.dev'}
          onCancel={profile.cancel}
          onSave={profile.save}
        />
      </div>
    </div>,
    document.body,
  );
}
