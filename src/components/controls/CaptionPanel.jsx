import '../../styles/components/CaptionPanel.css';

const COLORS = [
  { label: 'White', value: '#FFFFFF' },
  { label: 'Yellow', value: '#E6D400' },
];

export default function CaptionPanel({ config, onChange, onClose }) {
  const update = (key, value) => onChange({ ...config, [key]: value });

  return (
    <div className="caption-panel">
      <div className="caption-panel__header">
        <span className="caption-panel__title">Caption</span>
        <button
          className="caption-panel__close"
          onClick={onClose}
          type="button"
          aria-label="Close caption panel"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <input
        className="caption-panel__input"
        type="text"
        value={config.text}
        onChange={e => update('text', e.target.value)}
        placeholder="Add a caption…"
        maxLength={120}
        spellCheck={false}
        autoFocus
      />

      <div className="caption-panel__controls">
        <div className="caption-panel__control caption-panel__control--grow">
          <span className="caption-panel__control-label">Size</span>
          <div className="caption-panel__slider-row">
            <span className="caption-panel__slider-bound">12</span>
            <input
              className="caption-panel__slider"
              type="range"
              min={12}
              max={18}
              step={0.5}
              value={config.size}
              onChange={e => update('size', Number(e.target.value))}
            />
            <span className="caption-panel__slider-bound">18</span>
          </div>
        </div>

        <div className="caption-panel__control">
          <span className="caption-panel__control-label">Italic</span>
          <button
            className={`caption-panel__pill ${config.italic ? 'caption-panel__pill--active' : ''}`}
            onClick={() => update('italic', !config.italic)}
            type="button"
          >
            <em>I</em>
          </button>
        </div>

        <div className="caption-panel__control">
          <span className="caption-panel__control-label">Color</span>
          <div className="caption-panel__swatches">
            {COLORS.map(c => (
              <button
                key={c.value}
                className={`caption-panel__swatch ${config.color === c.value ? 'caption-panel__swatch--active' : ''}`}
                style={{ background: c.value }}
                onClick={() => update('color', c.value)}
                type="button"
                aria-label={c.label}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
