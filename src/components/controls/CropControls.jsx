import { CROP_PRESETS } from '../../utils/constants';
import Tooltip from '../ui/Tooltip';
import '../../styles/components/CropControls.css';

export default function CropControls({ currentPreset, onPresetChange }) {
  const presets = [
    { value: CROP_PRESETS.NONE, label: 'None', tooltip: 'Show full image without cropping' },
    { value: CROP_PRESETS.LANDSCAPE, label: '16:9', tooltip: 'Crop to widescreen format' },
    { value: CROP_PRESETS.PORTRAIT, label: '9:16', tooltip: 'Crop to vertical format' },
  ];

  return (
    <div className="crop-controls">
      <span className="crop-controls__label">Crop</span>
      <div className="crop-controls__buttons">
        {presets.map((preset) => (
          <Tooltip key={preset.value} content={preset.tooltip} position="top">
            <button
              className={`crop-controls__button ${
                currentPreset === preset.value ? 'crop-controls__button--active' : ''
              }`}
              onClick={() => onPresetChange(preset.value)}
              type="button"
              aria-label={`${preset.label} - ${preset.tooltip}`}
            >
              {preset.label}
            </button>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}
