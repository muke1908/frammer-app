import Tooltip from './Tooltip';
import '../../styles/components/Toggle.css';

export default function Toggle({ label, value, onToggle, leftLabel, rightLabel, tooltip }) {
  const button = (
    <button
      className="toggle__button"
      onClick={onToggle}
      aria-label={tooltip || label}
      type="button"
    >
      <span className="toggle__option">{leftLabel}</span>
      <span className="toggle__divider">/</span>
      <span className="toggle__option">{rightLabel}</span>
      <span
        className="toggle__indicator"
        style={{
          transform: value === leftLabel ? 'translateX(0)' : 'translateX(100%)',
        }}
      />
    </button>
  );

  return (
    <div className="toggle">
      {label && <span className="toggle__label">{label}</span>}
      {tooltip ? (
        <Tooltip content={tooltip} position="top">
          {button}
        </Tooltip>
      ) : (
        button
      )}
    </div>
  );
}
