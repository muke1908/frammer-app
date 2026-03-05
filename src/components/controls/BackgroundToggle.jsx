import Toggle from '../ui/Toggle';
import { FRAME_BACKGROUNDS } from '../../utils/constants';

export default function BackgroundToggle({ background, onToggle }) {
  // Capitalize for display
  const displayValue = background.charAt(0).toUpperCase() + background.slice(1);

  return (
    <Toggle
      label="Background"
      value={displayValue}
      onToggle={onToggle}
      leftLabel="Black"
      rightLabel="White"
      tooltip="Switch frame background color"
    />
  );
}
