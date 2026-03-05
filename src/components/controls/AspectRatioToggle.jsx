import Toggle from '../ui/Toggle';
import { ASPECT_RATIOS } from '../../utils/constants';

export default function AspectRatioToggle({ aspectRatio, onToggle }) {
  return (
    <Toggle
      label="Frame"
      value={aspectRatio}
      onToggle={onToggle}
      leftLabel={ASPECT_RATIOS.LANDSCAPE}
      rightLabel={ASPECT_RATIOS.PORTRAIT}
      tooltip="Toggle frame between landscape and portrait"
    />
  );
}
