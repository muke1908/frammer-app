import Tooltip from './Tooltip';
import '../../styles/components/Button.css';

export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  type = 'button',
  className = '',
  tooltip,
  tooltipPosition = 'top',
  ...props
}) {
  const buttonClass = `button button--${variant} button--${size} ${className}`.trim();

  const button = (
    <button
      type={type}
      className={buttonClass}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );

  if (tooltip && !disabled) {
    return (
      <Tooltip content={tooltip} position={tooltipPosition}>
        {button}
      </Tooltip>
    );
  }

  return button;
}
