import { useState, type ReactNode } from 'react';
import { Avatar, AvatarPicker } from 'glyph-avatars/react';
import { ProfileWindow, useProfile } from './profile';

function Window(props: { crumb: string; children: ReactNode; tall?: boolean }) {
  const { crumb, children, tall = false } = props;
  return (
    <div className={tall ? 'pd-window tall' : 'pd-window'}>
      <div className="pd-bar"><span>Settings</span><span className="pd-sep">/</span><b>{crumb}</b></div>
      {children}
    </div>
  );
}

export function InDialog() {
  const profile = useProfile();
  return <ProfileWindow profile={profile} hint />;
}

export function OnPage() {
  const [value, setValue] = useState('maya@studio.dev');
  const [open, setOpen] = useState(true);
  return (
    <Window crumb="Profile">
      <div className="pd-body">
        <div className="pd-row">
          <div className="pd-label"><b>Profile photo</b><p>Pick an avatar. You can change it any time.</p></div>
          <div className="pl-current">
            <Avatar key={value} value={value} size={48} />
            {!open && <button type="button" className="btn small" onClick={() => setOpen(true)}>Change</button>}
          </div>
        </div>
        {open && (
          <div className="pl-inline">
            <AvatarPicker
              className="pl-flat"
              title=""
              description=""
              defaultValue={value}
              onCancel={() => setOpen(false)}
              onSave={(next) => {
                setValue(next);
                setOpen(false);
              }}
            />
          </div>
        )}
        <div className="pd-row">
          <div className="pd-label"><b>Full name</b></div>
          <span className="pd-field">Maya Chen</span>
        </div>
      </div>
    </Window>
  );
}

export function InPopover() {
  const [value, setValue] = useState('maya@studio.dev');
  const [open, setOpen] = useState(true);
  return (
    <Window crumb="Profile" tall>
      <div className="pd-body">
        <div className="pd-row">
          <div className="pd-label"><b>Profile photo</b><p>Click it to pick another.</p></div>
          <div className="pd-anchor">
            <button type="button" className="pd-photo" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
              <Avatar key={value} value={value} size={56} />
            </button>
            {open && (
              <div className="pl-pop">
                <AvatarPicker
                  title=""
                  description=""
                  defaultValue={value}
                  onCancel={() => setOpen(false)}
                  onSave={(next) => {
                    setValue(next);
                    setOpen(false);
                  }}
                />
              </div>
            )}
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
    </Window>
  );
}

export function SignUp() {
  const [done, setDone] = useState<string | null>(null);
  return (
    <div className="pd-window pl-signup">
      {done ? (
        <div className="pl-done">
          <Avatar value={done} size={88} />
          <h4>Welcome, Maya</h4>
          <p>You’re all set.</p>
          <button type="button" className="btn small" onClick={() => setDone(null)}>Start over</button>
        </div>
      ) : (
        <>
          <div className="pl-steps"><span className="on" /><span className="on" /><span /></div>
          <div className="pl-ask">
            <h4>Pick an avatar</h4>
            <p>Step 2 of 3. You can change it later.</p>
          </div>
          <AvatarPicker className="pl-flat" title="" description="" defaultValue="maya@studio.dev" saveLabel="Continue" onSave={setDone} />
        </>
      )}
    </div>
  );
}

export const PLACES = [
  { id: 'dialog', label: 'In a dialog', note: 'Open it from the profile photo, inside your own dialog.', code: '<Dialog open={open}>\n  <AvatarPicker onSave={save} onCancel={close} />\n</Dialog>', View: InDialog },
  { id: 'page', label: 'On the page', note: 'Show it right in your settings, no popup.', code: '<AvatarPicker title="" onSave={save} />', View: OnPage },
  { id: 'popover', label: 'In a popover', note: 'A smaller one, right next to the photo.', code: '<Popover>\n  <AvatarPicker title="" description="" onSave={save} />\n</Popover>', View: InPopover },
  { id: 'signup', label: 'When signing up', note: 'Let people pick one as part of sign-up.', code: '<AvatarPicker saveLabel="Continue" onSave={next} />', View: SignUp },
];
