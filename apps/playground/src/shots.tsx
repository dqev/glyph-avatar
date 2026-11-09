import {
  AvatarPicker,
  AvatarPickerHoneycomb,
  AvatarPickerNewBackground,
  AvatarPickerNewColors,
  AvatarPickerNewShape,
  AvatarPickerPreview,
  AvatarPickerReset,
  AvatarPickerRoot,
  AvatarPickerShuffle,
  useAvatarPicker,
} from 'glyph-avatar/react';

function SaveButton() {
  const { value } = useAvatarPicker();
  return <button type="button" className="parts-save" onClick={() => console.log(value)}>Save</button>;
}

export function Shots() {
  return (
    <div className="shots">
      <div className="shot dark" data-shot="picker">
        <AvatarPicker defaultValue="maya@notemap.com" onCancel={() => {}} />
      </div>

      <div className="shot light" data-shot="picker-light">
        <AvatarPicker className="light-picker" defaultValue="maya@notemap.com" onCancel={() => {}} />
      </div>

      <div className="shot dark" data-shot="picker-parts">
        <AvatarPickerRoot defaultValue="maya@notemap.com" unstyled className="parts">
          <div className="parts-side">
            <AvatarPickerPreview size={88} />
            <AvatarPickerShuffle>Shuffle</AvatarPickerShuffle>
            <AvatarPickerNewShape>Shape</AvatarPickerNewShape>
            <AvatarPickerNewColors>Colors</AvatarPickerNewColors>
            <AvatarPickerNewBackground>Background</AvatarPickerNewBackground>
            <AvatarPickerReset />
            <SaveButton />
          </div>
          <AvatarPickerHoneycomb />
        </AvatarPickerRoot>
      </div>
    </div>
  );
}
